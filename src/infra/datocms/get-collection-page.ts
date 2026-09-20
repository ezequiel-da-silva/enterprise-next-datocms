import type { AppLocale } from "@/constants/i18n";
import { toDatoSiteLocale } from "@/constants/i18n";
import { cdaFetchCache } from "@/infra/datocms/cda-fetch-cache";
import { datocmsFetch, type DatocmsResponse } from "@/infra/datocms/client";
import type { CollectionPageByHandleQuery } from "@/infra/datocms/generated/operations.types";
import { COLLECTION_PAGE_BY_HANDLE } from "@/infra/datocms/queries";
import { cache } from "react";

const loadCollectionPage = cache(
  async (
    locale: AppLocale,
    handle: string,
    includeDrafts: boolean,
  ): Promise<DatocmsResponse<CollectionPageByHandleQuery>> => {
    return datocmsFetch<CollectionPageByHandleQuery>({
      query: COLLECTION_PAGE_BY_HANDLE,
      variables: { locale: toDatoSiteLocale(locale), handle },
      includeDrafts,
      ...cdaFetchCache({
        includeDrafts,
        tags: ["datocms:collection", `collection:${handle}`],
        revalidate: 120,
        bypassPublishedCacheInDev: true,
      }),
    });
  },
);

export function getCollectionPageByHandle(
  locale: AppLocale,
  handle: string,
  includeDrafts: boolean,
): Promise<DatocmsResponse<CollectionPageByHandleQuery>> {
  return loadCollectionPage(locale, handle, includeDrafts);
}
