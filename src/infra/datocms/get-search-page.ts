import type { AppLocale } from "@/constants/i18n";
import { toDatoSiteLocale } from "@/constants/i18n";
import { datocmsFetch, type DatocmsResponse } from "@/infra/datocms/client";
import type { GetSearchPageQuery } from "@/infra/datocms/generated/operations.types";
import { GET_SEARCH_PAGE } from "@/infra/datocms/queries";
import { cmsPageCanonicalPath } from "@/lib/datocms/cms-page-path";
import { cache } from "react";
import { stripStega } from "react-datocms/stega";

export { readSearchQuery, searchResultsPath } from "@/lib/datocms/search-query";

export type SearchPageReference = NonNullable<
  NonNullable<GetSearchPageQuery["globalSetting"]>["searchPage"]
>;

/** Slugs históricos / localizados da página de busca. */
export const SEARCH_PAGE_ALIAS_SLUGS = new Set(["busca", "search", "busqueda"]);

const loadSearchPage = cache(
  async (
    locale: AppLocale,
    includeDrafts: boolean,
  ): Promise<DatocmsResponse<GetSearchPageQuery>> => {
    const devPublishedNoStore = process.env.NODE_ENV === "development" && !includeDrafts;

    return datocmsFetch<GetSearchPageQuery>({
      query: GET_SEARCH_PAGE,
      variables: { locale: toDatoSiteLocale(locale) },
      tags:
        includeDrafts || devPublishedNoStore
          ? undefined
          : ["datocms:global-settings", `global-settings:${locale}`, "datocms:page"],
      revalidate: includeDrafts || devPublishedNoStore ? false : 300,
      includeDrafts,
      cache: includeDrafts || devPublishedNoStore ? "no-store" : undefined,
    });
  },
);

/**
 * A referência é opcional durante a implantação da migration. Enquanto o campo
 * ainda não existir (ou não estiver preenchido), mantém o caminho histórico.
 */
export async function getSearchPage(
  locale: AppLocale,
  includeDrafts: boolean,
): Promise<SearchPageReference | null> {
  const result = await loadSearchPage(locale, includeDrafts);
  if ("errors" in result) return null;
  return result.data.globalSetting?.searchPage ?? null;
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
