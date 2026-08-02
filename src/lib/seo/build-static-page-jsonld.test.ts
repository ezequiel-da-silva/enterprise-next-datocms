import { beforeEach, describe, expect, it, vi } from "vitest";

vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com");

import { buildStaticPageJsonLd } from "@/lib/seo/build-static-page-jsonld";

describe("buildStaticPageJsonLd", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com");
  });

  it("builds WebPage", () => {
    const graph = buildStaticPageJsonLd("WebPage", "Contact", "/contato", "Get in touch");
    expect(graph[0]["@type"]).toBe("WebPage");
    expect(graph[0].url).toBe("https://example.com/contato");
    expect(graph[0].description).toBe("Get in touch");
  });

  it("builds ContactPage", () => {
    const graph = buildStaticPageJsonLd("ContactPage", "Contact", "/contato");
    expect(graph[0]["@type"]).toBe("ContactPage");
  });
});
