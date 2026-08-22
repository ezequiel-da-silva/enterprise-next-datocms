import { describe, expect, it } from "vitest";
import { buildDatoPageMetadata } from "@/lib/seo/build-dato-page-metadata";
import type { TitleMetaLinkTag } from "react-datocms/seo";

/** Simula o fallback global do Dato: título genérico igual para todas as páginas. */
const GLOBAL_FALLBACK_TAGS: TitleMetaLinkTag[] = [
  { tag: "title", content: "Homepage", attributes: null },
  { tag: "meta", content: null, attributes: { property: "og:title", content: "Homepage" } },
];

const EMPTY_SEO = {
  title: null,
  description: null,
  twitterCard: null,
  noIndex: null,
  image: null,
};

describe("buildDatoPageMetadata title resolution", () => {
  it("prefers the record title over the Dato global fallback", () => {
    const meta = buildDatoPageMetadata({
      path: "/en/page-two",
      seoMetaTags: GLOBAL_FALLBACK_TAGS,
      faviconMetaTags: null,
      seoSettingsSocial: EMPTY_SEO,
      fallbackTitle: "The page that exists just to be linked",
    });

    expect(meta.title).toBe("The page that exists just to be linked");
    expect(meta.openGraph?.title).toBe("The page that exists just to be linked");
  });

  it("keeps an explicit SEO field title over the record title", () => {
    const meta = buildDatoPageMetadata({
      path: "/en/page-two",
      seoMetaTags: GLOBAL_FALLBACK_TAGS,
      faviconMetaTags: null,
      seoSettingsSocial: { ...EMPTY_SEO, title: "Curated SEO title" },
      fallbackTitle: "The page that exists just to be linked",
    });

    expect(meta.title).toBe("Curated SEO title");
  });

  it("falls back to Dato tags when no record title is available", () => {
    const meta = buildDatoPageMetadata({
      path: "/en/page-two",
      seoMetaTags: GLOBAL_FALLBACK_TAGS,
      faviconMetaTags: null,
      seoSettingsSocial: EMPTY_SEO,
    });

    expect(meta.title).toBe("Homepage");
  });

  it("ignores whitespace-only titles", () => {
    const meta = buildDatoPageMetadata({
      path: "/en/page-two",
      seoMetaTags: GLOBAL_FALLBACK_TAGS,
      faviconMetaTags: null,
      seoSettingsSocial: { ...EMPTY_SEO, title: "   " },
      fallbackTitle: "Record title",
    });

    expect(meta.title).toBe("Record title");
  });

  it("syncs seoSettingsSocial description and image to OG and Twitter", () => {
    const meta = buildDatoPageMetadata({
      path: "/en/page-two",
      seoMetaTags: GLOBAL_FALLBACK_TAGS,
      faviconMetaTags: null,
      seoSettingsSocial: {
        ...EMPTY_SEO,
        title: "Share title",
        description: "Share description",
        image: {
          url: "https://www.datocms-assets.com/og.jpg",
          alt: "OG",
          width: 1200,
          height: 630,
        },
      },
    });

    expect(meta.description).toBe("Share description");
    expect(meta.openGraph?.description).toBe("Share description");
    expect(meta.openGraph?.images).toEqual([
      {
        url: "https://www.datocms-assets.com/og.jpg",
        alt: "OG",
        width: 1200,
        height: 630,
      },
    ]);
    expect(meta.twitter).toMatchObject({
      title: "Share title",
      description: "Share description",
      images: ["https://www.datocms-assets.com/og.jpg"],
    });
  });

  it("sets og:locale:alternate from hreflang paths", () => {
    const meta = buildDatoPageMetadata({
      path: "/en/page-two",
      seoMetaTags: GLOBAL_FALLBACK_TAGS,
      faviconMetaTags: null,
      seoSettingsSocial: EMPTY_SEO,
      hreflangPaths: {
        en: "/en/page-two",
        pt: "/pt/pagina-dois",
      },
    });

    expect(meta.openGraph?.locale).toBe("en_US");
    expect(meta.openGraph?.alternateLocale).toEqual(["pt_BR"]);
  });

  it("sets openGraph.url from the canonical path", () => {
    const meta = buildDatoPageMetadata({
      path: "/en/page-two",
      seoMetaTags: GLOBAL_FALLBACK_TAGS,
      faviconMetaTags: null,
      seoSettingsSocial: EMPTY_SEO,
    });

    expect(meta.openGraph?.url).toBe("http://localhost:3000/en/page-two");
  });

  it("falls back to content or default OG image when SEO image is empty", () => {
    const meta = buildDatoPageMetadata({
      path: "/en/page-two",
      seoMetaTags: GLOBAL_FALLBACK_TAGS,
      faviconMetaTags: null,
      seoSettingsSocial: EMPTY_SEO,
      fallbackTitle: "Record title",
      fallbackOgImage: "https://www.datocms-assets.com/hero.jpg",
    });

    expect(meta.openGraph?.images).toEqual([
      { url: "https://www.datocms-assets.com/hero.jpg", alt: "Record title" },
    ]);
    expect(meta.twitter).toMatchObject({
      card: "summary_large_image",
      images: ["https://www.datocms-assets.com/hero.jpg"],
    });
  });
});
