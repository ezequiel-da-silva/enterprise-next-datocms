import { describe, expect, it } from "vitest";
import { buildLlmsTxt, llmsBlurb, llmsPublicTitle } from "@/lib/seo/build-llms-txt";

describe("llmsBlurb", () => {
  it("collapses whitespace and keeps a short line", () => {
    expect(llmsBlurb("  Leve\n e quente. ")).toBe("Leve e quente.");
  });

  it("cuts a long line near 160 characters", () => {
    const blurb = llmsBlurb(`${"palavra ".repeat(40)}fim`);
    expect(blurb?.endsWith("…")).toBe(true);
    expect(blurb!.length).toBeLessThanOrEqual(161);
  });
});

describe("llmsPublicTitle", () => {
  it("prefers the hero heading over the SEO title and the record title", () => {
    expect(
      llmsPublicTitle({
        heroTitle: " Snowboards for the next run ",
        seoTitle: "Homepage",
        recordTitle: "The most meta content you'll read today",
      }),
    ).toBe("Snowboards for the next run");
  });

  it("uses the SEO title when the page has no hero heading", () => {
    expect(llmsPublicTitle({ heroTitle: "  ", seoTitle: "Refund policy", recordTitle: "Legal" })).toBe(
      "Refund policy",
    );
  });

  it("falls back to the record title when hero and SEO titles are empty", () => {
    expect(llmsPublicTitle({ heroTitle: null, seoTitle: "", recordTitle: "Contact" })).toBe("Contact");
    expect(llmsPublicTitle({ recordTitle: "   " })).toBeUndefined();
  });
});

describe("buildLlmsTxt", () => {
  it("lists products, collections and policies per locale with a citable line", () => {
    const body = buildLlmsTxt({
      siteName: "Tech Starter Kit",
      description: "Loja de snowboards.",
      pages: [{ title: "Home", url: "https://example.com/en", description: "Página inicial" }],
      blog: [],
      products: [
        {
          title: "Liquid [snow]",
          url: "https://example.com/en/products/liquid",
          description: "Top and bottom view.",
        },
        { title: "Liquid", url: "https://example.com/pt/products/liquid", description: "Vista de cima." },
      ],
      collections: [
        { title: "Snowboards", url: "https://example.com/en/collections/snowboards", description: null },
      ],
      policies: [
        {
          title: "Refund policy",
          url: "https://example.com/en/refund-policy",
          description: "30 days, free returns.",
        },
      ],
      sitemapUrl: "https://example.com/sitemap.xml",
      robotsUrl: "https://example.com/robots.txt",
    });

    expect(body).toContain("# Tech Starter Kit");
    expect(body).toContain("## Products");
    expect(body).toContain("- [Liquid snow](https://example.com/en/products/liquid): Top and bottom view.");
    expect(body).toContain("- [Liquid](https://example.com/pt/products/liquid): Vista de cima.");
    expect(body).toContain("- [Snowboards](https://example.com/en/collections/snowboards)");
    expect(body).not.toContain("collections/snowboards):");
    expect(body).toContain("## Policies");
    expect(body).toContain("- [Refund policy](https://example.com/en/refund-policy): 30 days, free returns.");
    expect(body).not.toContain("## Blog");
    expect(body).toContain("- [Sitemap](https://example.com/sitemap.xml)");
  });
});
