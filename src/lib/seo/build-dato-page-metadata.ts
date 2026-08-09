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
  /**
   * Título do próprio registo (ex. `page.title`). Usado quando o campo SEO está vazio —
   * sem isto o Dato devolve o fallback global e todas as páginas ficam com o mesmo `<title>`.
   */
  fallbackTitle?: string | null;
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
  fallbackTitle,
}: BuildArgs): Metadata {
  const baseUrl = getSiteBaseUrl();
  const canonicalPath = path.startsWith("/") ? path : `/${path}`;
  const canonical = new URL(canonicalPath, baseUrl).toString();

  const tags = [...(seoMetaTags ?? []), ...(faviconMetaTags ?? [])];
  const fromTags = toNextMetadata(tags) as Metadata;

  const s = seoSettingsSocial;
  const fromField: Metadata = {};

  const resolvedTitle = s?.title?.trim() || fallbackTitle?.trim() || "";

  const openGraph: NonNullable<Metadata["openGraph"]> = { ...fromTags.openGraph };
  const twitterBase = typeof fromTags.twitter === "object" && fromTags.twitter ? fromTags.twitter : {};
  const twitterTitle = resolvedTitle ? { title: resolvedTitle } : {};
  const twitterCard = s?.twitterCard as "summary" | "summary_large_image" | "player" | "app" | undefined;
  let hasOpenGraph = false;

  if (s?.noIndex) {
    fromField.robots = { index: false, follow: true };
  }
  if (resolvedTitle) {
    fromField.title = resolvedTitle;
    openGraph.title = resolvedTitle;
    hasOpenGraph = true;
  }
  if (s?.description) {
    fromField.description = s.description;
  }
  if (s?.image?.url) {
    openGraph.images = [
      {
        url: s.image.url,
        alt: s.image.alt ?? undefined,
        width: s.image.width ?? undefined,
        height: s.image.height ?? undefined,
      },
    ];
    hasOpenGraph = true;
  }

  if (hasOpenGraph) {
    fromField.openGraph = openGraph;
  }
  /* `card` discrimina a união Twitter do Next — precisa de ser um literal na criação do objeto. */
  if (twitterCard) {
    fromField.twitter = { ...twitterBase, ...twitterTitle, card: twitterCard };
  } else if (resolvedTitle) {
    fromField.twitter = { ...twitterBase, ...twitterTitle };
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
