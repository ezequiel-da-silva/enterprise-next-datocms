import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "./proxy";
import { DEFAULT_APP_LOCALE } from "@/constants/i18n";

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
  it("redirects / to the default locale with a 308", () => {
    const res = proxy(makeRequest("/"));
    expect(res.status).toBe(308);
    expect(res.headers.get("location")).toContain(`/${DEFAULT_APP_LOCALE}`);
  });

  it("carries security headers on the root redirect", () => {
    const res = proxy(makeRequest("/"));
    for (const header of SECURITY_HEADERS) {
      expect(res.headers.get(header), `missing ${header}`).toBeTruthy();
    }
    expect(res.headers.get("strict-transport-security")).toBeTruthy();
  });

  it("applies security headers on a normal locale request", () => {
    const res = proxy(makeRequest(`/${DEFAULT_APP_LOCALE}/page-two`));
    for (const header of SECURITY_HEADERS) {
      expect(res.headers.get(header), `missing ${header}`).toBeTruthy();
    }
  });

  it("emits a per-request nonce inside the CSP", () => {
    const a = proxy(makeRequest(`/${DEFAULT_APP_LOCALE}`)).headers.get("content-security-policy") ?? "";
    const b = proxy(makeRequest(`/${DEFAULT_APP_LOCALE}`)).headers.get("content-security-policy") ?? "";
    expect(a).toMatch(/'nonce-[^']+'/);
    expect(a).not.toBe(b);
  });
});
