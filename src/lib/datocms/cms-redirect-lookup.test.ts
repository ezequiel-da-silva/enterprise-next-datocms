import { describe, expect, it } from "vitest";
import { shouldLookupCmsRedirects } from "./cms-redirect-lookup";

describe("shouldLookupCmsRedirects", () => {
  it("looks up redirects on locale pages", () => {
    expect(shouldLookupCmsRedirects("/en")).toBe(true);
    expect(shouldLookupCmsRedirects("/en/blog")).toBe(true);
    expect(shouldLookupCmsRedirects("/pt/contato")).toBe(true);
  });

  it("skips APIs, metadata, and the root locale redirect", () => {
    expect(shouldLookupCmsRedirects("/")).toBe(false);
    expect(shouldLookupCmsRedirects("/api/draft")).toBe(false);
    expect(shouldLookupCmsRedirects("/robots.txt")).toBe(false);
    expect(shouldLookupCmsRedirects("/sitemap.xml")).toBe(false);
    expect(shouldLookupCmsRedirects("/manifest.webmanifest")).toBe(false);
    expect(shouldLookupCmsRedirects("/llms.txt")).toBe(false);
    expect(shouldLookupCmsRedirects("/icon")).toBe(false);
  });
});
