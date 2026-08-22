import { describe, expect, it } from "vitest";
import { buildSiteJsonLdGraph } from "@/lib/seo/json-ld-site";
import { buildSiteIdentity } from "@/lib/seo/site-identity";

describe("buildSiteJsonLdGraph", () => {
  it("lists every app language on WebSite and uses identity logo/sameAs", () => {
    const identity = buildSiteIdentity({
      seo: { siteName: "Acme" },
      logoUrl: "https://www.datocms-assets.com/logo.png",
      socialLinks: [{ url: "https://github.com/acme" }],
    });
    const graph = buildSiteJsonLdGraph(identity);
    const website = graph.find((node) => node["@type"] === "WebSite");
    const org = graph.find((node) => node["@type"] === "Organization");
    expect(website?.inLanguage).toEqual(["en", "pt-BR", "es"]);
    expect(website?.availableLanguage).toEqual(["en", "pt-BR", "es"]);
    expect(website?.name).toBe("Acme");
    expect(org?.name).toBe("Acme");
    expect(org?.logo).toEqual({ "@type": "ImageObject", url: "https://www.datocms-assets.com/logo.png" });
    expect(org?.sameAs).toEqual(["https://github.com/acme"]);
  });
});
