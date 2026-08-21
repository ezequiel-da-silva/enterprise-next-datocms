import type { AppLocale, DatoSiteLocale } from "@/constants/i18n";
import { toDatoSiteLocale } from "@/constants/i18n";
import { getAuthorBySlug, getCategoryBySlug, getPostBySlug } from "@/infra/datocms/get-blog";
import { getPageBySlug } from "@/infra/datocms/get-page";
import type { DatoSlugLocaleEntry } from "@/lib/seo/hreflang";
import {
  buildLocaleSwitcherHrefs,
  parseLocalePath,
  slugPathsFromBlogRecord,
  slugPathsFromCmsLocales,
} from "@/lib/i18n/locale-switch-href";

async function loadBlogSlugLocales(
  kind: "post" | "author" | "category",
  datoLocale: DatoSiteLocale,
  slug: string,
  includeDrafts: boolean,
): Promise<ReadonlyArray<DatoSlugLocaleEntry> | null> {
  if (kind === "post") {
    const result = await getPostBySlug(datoLocale, slug, includeDrafts);
    if ("errors" in result) return null;
    return result.data.post?.slugLocales ?? null;
  }
  if (kind === "author") {
    const result = await getAuthorBySlug(datoLocale, slug, includeDrafts);
    if ("errors" in result) return null;
    return result.data.author?.slugLocales ?? null;
  }
  const result = await getCategoryBySlug(datoLocale, slug, includeDrafts);
  if ("errors" in result) return null;
  return result.data.category?.slugLocales ?? null;
}

/**
 * Resolve hrefs do seletor a partir do pathname. Fetch CDA só em rotas com slug localizado
 * (reutiliza o cache de `getPageBySlug` / blog da página).
 */
export async function resolveLocaleSwitcherHrefs(
  pathname: string,
  locale: AppLocale,
  includeDrafts: boolean,
): Promise<Record<AppLocale, string>> {
  const kind = parseLocalePath(pathname);

  if (kind.kind === "cms") {
    const result = await getPageBySlug(kind.slug, includeDrafts, locale);
    if (!("errors" in result) && result.data.page) {
      return buildLocaleSwitcherHrefs(pathname, slugPathsFromCmsLocales(result.data.page.slugLocales));
    }
    return buildLocaleSwitcherHrefs(pathname);
  }

  if (kind.kind === "post" || kind.kind === "author" || kind.kind === "category") {
    const slugLocales = await loadBlogSlugLocales(
      kind.kind,
      toDatoSiteLocale(locale),
      kind.slug,
      includeDrafts,
    );
    if (slugLocales) {
      return buildLocaleSwitcherHrefs(pathname, slugPathsFromBlogRecord(kind.kind, slugLocales));
    }
    return buildLocaleSwitcherHrefs(pathname);
  }

  return buildLocaleSwitcherHrefs(pathname);
}
