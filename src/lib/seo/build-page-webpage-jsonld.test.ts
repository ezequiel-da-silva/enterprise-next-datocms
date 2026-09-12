import { beforeEach, describe, expect, it, vi } from "vitest";

vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com");

import { buildPageWebPageJsonLd } from "@/lib/seo/build-page-webpage-jsonld";

describe("buildPageWebPageJsonLd", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com");
  });

  it("emits ContactPage when the configured contact Page is rendered", () => {
    const graph = buildPageWebPageJsonLd({
      path: "/en/contact",
      title: "Contact",
      description: "Get in touch",
      locale: "en",
      pageType: "ContactPage",
    });
    expect(graph[0]["@type"]).toBe("ContactPage");
    expect(graph[0].url).toBe("https://example.com/en/contact");
  });
});
