import type { AppLocale } from "@/constants/i18n";
import { getGlobalSettings, pickGlobalSetting } from "@/infra/datocms/get-global-settings";
import type { GlobalSettingPageRef } from "@/infra/datocms/types-global-setting";
import { cmsPageCanonicalPath } from "@/lib/datocms/cms-page-path";
import { stripStega } from "react-datocms/stega";

export { readSearchQuery, searchResultsPath } from "@/lib/datocms/search-query";

export type SearchPageReference = NonNullable<GlobalSettingPageRef>;

/** Slugs históricos / localizados da página de busca. */
export const SEARCH_PAGE_ALIAS_SLUGS = new Set(["busca", "search", "busqueda"]);

export async function getSearchPage(
  locale: AppLocale,
  includeDrafts: boolean,
): Promise<SearchPageReference | null> {
  const setting = pickGlobalSetting(await getGlobalSettings(locale, includeDrafts));
  return setting?.searchPage ?? null;
}

export function searchPagePath(
  locale: AppLocale,
  page: SearchPageReference | null | undefined,
): string {
  const slug = page?.slug?.trim();
  return slug ? cmsPageCanonicalPath(slug, locale) : `/${locale}/busca`;
}

export function searchPageLabel(page: SearchPageReference | null | undefined): string {
  const title = page?.title;
  return title && stripStega(title).trim() ? title : "Busca";
}

export function isSearchPageAliasSlug(slug: string): boolean {
  return SEARCH_PAGE_ALIAS_SLUGS.has(slug.toLowerCase());
}

export function contentNeedsSearchResults(blocks: { __typename?: string }[]): boolean {
  return blocks.some((block) => block.__typename === "SearchSectionRecord");
}
