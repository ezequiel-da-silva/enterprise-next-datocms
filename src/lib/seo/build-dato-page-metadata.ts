import { getSiteBaseUrl } from "@/lib/seo/site-config";
import type { AppLocale } from "@/constants/i18n";
import { buildHreflangAlternates } from "@/lib/seo/hreflang";
import type { Metadata } from "next";
import { toNextMetadata, type TitleMetaLinkTag } from "react-datocms/seo";
import type { SeoSettingsSocial } from "@/infra/datocms/types-page";

type BuildArgs = {
  path: string;
  seoMetaTags: TitleMetaLinkTag[] | null | undefined;
  faviconMetaTags: TitleMetaLinkTag[] | null | undefined;
  seoSettingsSocial?: SeoSettingsSocial;
  /** Same logical page in other locales (hreflang). */
  hreflangPaths?: Partial<Record<AppLocale, string>>;
};

/**
 * `_seoMetaTags` já incorpora o campo `seo_settings_social` + preferências globais (DatoCMS).
 * `toNextMetadata` cobre Open Graph e Twitter; reforçamos campos crus do SEO field quando preenchidos.
 */
export function buildDatoPageMetadata({
  path,
  seoMetaTags,
  faviconMetaTags,
  seoSettingsSocial,
  hreflangPaths,
}: BuildArgs): Metadata {
  const baseUrl = getSiteBaseUrl();
  const canonicalPath = path.startsWith("/") ? path : `/${path}`;
  const canonical = new URL(canonicalPath, baseUrl).toString();

  const tags = [...(seoMetaTags ?? []), ...(faviconMetaTags ?? [])];
  const fromTags = toNextMetadata(tags) as Metadata;

  const s = seoSettingsSocial;
  const fromField: Metadata = {};

  if (s?.noIndex) {
    fromField.robots = { index: false, follow: true };
  }
  if (s?.title) {
    fromField.title = s.title;
  }
  if (s?.description) {
    fromField.description = s.description;
  }
  if (s?.twitterCard) {
    fromField.twitter = {
      ...(typeof fromTags.twitter === "object" && fromTags.twitter ? fromTags.twitter : {}),
      card: s.twitterCard as "summary" | "summary_large_image" | "player" | "app",
    };
  }
  if (s?.image?.url) {
    fromField.openGraph = {
      ...fromTags.openGraph,
      images: [
        {
          url: s.image.url,
          alt: s.image.alt ?? undefined,
          width: s.image.width ?? undefined,
          height: s.image.height ?? undefined,
        },
      ],
    };
  }

  const hreflang = hreflangPaths ? buildHreflangAlternates(hreflangPaths) : undefined;

  return {
    ...fromTags,
    ...fromField,
    metadataBase: new URL(`${baseUrl}/`),
    alternates: {
      canonical,
      ...hreflang,
    },
  };
}
