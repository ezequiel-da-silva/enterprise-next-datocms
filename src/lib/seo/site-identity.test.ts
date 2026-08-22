import { describe, expect, it } from "vitest";
import { buildSiteIdentity, siteDefaultDocumentTitle } from "@/lib/seo/site-identity";

describe("buildSiteIdentity", () => {
  it("maps globalSeo, nav logo and social URLs", () => {
    const identity = buildSiteIdentity({
      seo: {
        siteName: "Acme CMS",
        titleSuffix: "- Acme",
        facebookPageUrl: "https://facebook.com/acme",
        twitterAccount: "@acme",
        fallbackSeo: {
          title: "Acme home",
          description: "We make widgets.",
          image: { url: "https://www.datocms-assets.com/og.jpg" },
        },
      },
      logoUrl: "https://www.datocms-assets.com/logo.png",
      socialLinks: [
        { url: "https://github.com/acme" },
        { url: "javascript:alert(1)" },
      ],
    });

    expect(identity.siteName).toBe("Acme CMS");
    expect(identity.organizationName).toBe("Acme CMS");
    expect(identity.description).toBe("We make widgets.");
    expect(identity.fallbackTitle).toBe("Acme home");
    expect(identity.fallbackOgImage).toBe("https://www.datocms-assets.com/og.jpg");
    expect(identity.logoUrl).toBe("https://www.datocms-assets.com/logo.png");
    expect(identity.sameAs).toEqual([
      "https://github.com/acme",
      "https://facebook.com/acme",
      "https://x.com/acme",
    ]);
    expect(siteDefaultDocumentTitle(identity)).toBe("Acme home - Acme");
  });

  it("falls back to env/site defaults when CMS is empty", () => {
    const identity = buildSiteIdentity({ seo: null });
    expect(identity.siteName.length).toBeGreaterThan(0);
    expect(identity.sameAs).toEqual([]);
  });
});
