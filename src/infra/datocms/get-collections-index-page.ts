import type { AppLocale } from "@/constants/i18n";
import { toDatoSiteLocale } from "@/constants/i18n";
import { datocmsFetch, type DatocmsResponse } from "@/infra/datocms/client";
import type { GetCollectionsIndexPageQuery } from "@/infra/datocms/generated/operations.types";
import { GET_COLLECTIONS_INDEX_PAGE } from "@/infra/datocms/queries";
import { cmsPageCanonicalPath } from "@/lib/datocms/cms-page-path";
import { cache } from "react";
import { stripStega } from "react-datocms/stega";

export type CollectionsIndexPageReference = NonNullable<
  NonNullable<GetCollectionsIndexPageQuery["globalSetting"]>["collectionsPage"]
>;

const loadCollectionsIndexPage = cache(
  async (
    locale: AppLocale,
    includeDrafts: boolean,
  ): Promise<DatocmsResponse<GetCollectionsIndexPageQuery>> => {
    const devPublishedNoStore = process.env.NODE_ENV === "development" && !includeDrafts;

    return datocmsFetch<GetCollectionsIndexPageQuery>({
      query: GET_COLLECTIONS_INDEX_PAGE,
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

export async function getCollectionsIndexPage(
  locale: AppLocale,
  includeDrafts: boolean,
): Promise<CollectionsIndexPageReference | null> {
  const result = await loadCollectionsIndexPage(locale, includeDrafts);
  if ("errors" in result) return null;
  return result.data.globalSetting?.collectionsPage ?? null;
}

export function collectionsIndexPath(
  locale: AppLocale,
  page: CollectionsIndexPageReference | null | undefined,
): string {
  const slug = page?.slug?.trim();
  return slug ? cmsPageCanonicalPath(slug, locale) : `/${locale}/collections`;
}

export function collectionsIndexLabel(page: CollectionsIndexPageReference | null | undefined): string {
  const title = page?.title;
  return title && stripStega(title).trim() ? title : "Collections";
}
