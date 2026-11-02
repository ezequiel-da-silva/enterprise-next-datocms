import { afterEach, describe, expect, it, vi } from "vitest";
import { getSiteBaseUrl } from "@/lib/seo/site-config";

describe("getSiteBaseUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("keeps a public URL and drops the trailing slash", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://enterprise-next-datocms.vercel.app/");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "ignored.vercel.app");
    expect(getSiteBaseUrl()).toBe("https://enterprise-next-datocms.vercel.app");
  });

  it("uses the Vercel production host when the public URL is localhost", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "enterprise-next-datocms.vercel.app");
    expect(getSiteBaseUrl()).toBe("https://enterprise-next-datocms.vercel.app");
  });

  it("uses the Vercel production host when the public URL is missing", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "https://enterprise-next-datocms.vercel.app/");
    expect(getSiteBaseUrl()).toBe("https://enterprise-next-datocms.vercel.app");
  });

  it("stays on localhost outside Vercel", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://127.0.0.1:3000/");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");
    expect(getSiteBaseUrl()).toBe("http://127.0.0.1:3000");
  });
});
