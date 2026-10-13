import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { DEFAULT_APP_LOCALE } from "@/constants/i18n";

const getRedirects = vi.fn();

vi.mock("@/infra/datocms/get-redirects", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/infra/datocms/get-redirects")>();
  return {
    ...actual,
    getRedirects: () => getRedirects(),
  };
});

import { proxy } from "./proxy";

const SECURITY_HEADERS = [
  "content-security-policy",
  "x-content-type-options",
  "referrer-policy",
  "permissions-policy",
  "cross-origin-opener-policy",
];

function makeRequest(path: string): NextRequest {
  return new NextRequest(new URL(path, "https://example.com"));
}

describe("proxy", () => {
  beforeEach(() => {
    getRedirects.mockReset();
    getRedirects.mockResolvedValue({ data: { allRedirects: [] } });
  });

  it("redirects / to the default locale with a 308", async () => {
    const res = await proxy(makeRequest("/"));
    expect(res.status).toBe(308);
    expect(res.headers.get("location")).toContain(`/${DEFAULT_APP_LOCALE}`);
    expect(getRedirects).not.toHaveBeenCalled();
  });

  it("carries security headers on the root redirect", async () => {
    const res = await proxy(makeRequest("/"));
    for (const header of SECURITY_HEADERS) {
      expect(res.headers.get(header), `missing ${header}`).toBeTruthy();
    }
    expect(res.headers.get("strict-transport-security")).toBeTruthy();
  });

  it("applies security headers on a normal locale request", async () => {
    const res = await proxy(makeRequest(`/${DEFAULT_APP_LOCALE}/page-two`));
    for (const header of SECURITY_HEADERS) {
      expect(res.headers.get(header), `missing ${header}`).toBeTruthy();
    }
  });

  it("emits a per-request nonce inside the CSP", async () => {
    const a = (await proxy(makeRequest(`/${DEFAULT_APP_LOCALE}`))).headers.get("content-security-policy") ?? "";
    const b = (await proxy(makeRequest(`/${DEFAULT_APP_LOCALE}`))).headers.get("content-security-policy") ?? "";
    expect(a).toMatch(/'nonce-[^']+'/);
    expect(a).not.toBe(b);
  });

  it("applies a published CMS redirect with security headers", async () => {
    getRedirects.mockResolvedValue({
      data: {
        allRedirects: [
          { id: "1", fromPathRedirect: "/en/old", toPathRedirect: "/en/new", statusRedirect: "301" },
        ],
      },
    });
    const res = await proxy(makeRequest("/en/old?x=1"));
    expect(res.status).toBe(301);
    expect(res.headers.get("location")).toBe("https://example.com/en/new?x=1");
    expect(res.headers.get("content-security-policy")).toBeTruthy();
  });

  it("does not apply CMS redirects to /api", async () => {
    getRedirects.mockResolvedValue({
      data: {
        allRedirects: [
          { id: "1", fromPathRedirect: "/api/draft", toPathRedirect: "/en", statusRedirect: "301" },
        ],
      },
    });
    const res = await proxy(makeRequest("/api/draft"));
    expect(res.status).toBe(200);
    expect(getRedirects).not.toHaveBeenCalled();
  });

  describe("optional CSP hosts", () => {
    async function csp() {
      return (await proxy(makeRequest(`/${DEFAULT_APP_LOCALE}`))).headers.get("content-security-policy") ?? "";
    }

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("leaves GA and Shopify consent hosts out by default", async () => {
      vi.stubEnv("GA_MEASUREMENT_ID", "");
      vi.stubEnv("SHOPIFY_STOREFRONT_PUBLIC_TOKEN", "");
      const header = await csp();
      expect(header).not.toContain("google");
      expect(header).not.toMatch(/connect-src[^;]*myshopify/);
    });

    it("allows GA4 hosts when a measurement ID is set", async () => {
      vi.stubEnv("GA_MEASUREMENT_ID", "G-TEST123");
      const header = await csp();
      expect(header).toMatch(/connect-src[^;]*https:\/\/\*\.google-analytics\.com/);
      expect(header).toMatch(/img-src[^;]*https:\/\/www\.googletagmanager\.com/);
    });

    it("allows the shop domain for Customer Privacy when the public token is set", async () => {
      vi.stubEnv("SHOPIFY_STOREFRONT_PUBLIC_TOKEN", "pub");
      vi.stubEnv("SHOPIFY_STORE_DOMAIN", "shop.myshopify.com");
      vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com");
      const header = await csp();
      expect(header).toMatch(/connect-src[^;]*https:\/\/shop\.myshopify\.com/);
      expect(header).toMatch(/script-src[^;]*https:\/\/cdn\.shopify\.com/);
    });
  });

  it("does not spend CDA on metadata routes but still sets CSP", async () => {
    for (const path of ["/robots.txt", "/sitemap.xml", "/manifest.webmanifest", "/llms.txt"]) {
      getRedirects.mockClear();
      const res = await proxy(makeRequest(path));
      expect(getRedirects, path).not.toHaveBeenCalled();
      expect(res.headers.get("content-security-policy"), path).toBeTruthy();
    }
  });
});
