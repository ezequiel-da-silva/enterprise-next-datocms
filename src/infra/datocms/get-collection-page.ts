import type { AppLocale } from "@/constants/i18n";
import { toDatoSiteLocale } from "@/constants/i18n";
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
    const devPublishedNoStore = process.env.NODE_ENV === "development" && !includeDrafts;

    return datocmsFetch<CollectionPageByHandleQuery>({
      query: COLLECTION_PAGE_BY_HANDLE,
      variables: { locale: toDatoSiteLocale(locale), handle },
      tags:
        includeDrafts || devPublishedNoStore
          ? undefined
          : ["datocms:collection", `collection:${handle}`],
      revalidate: includeDrafts || devPublishedNoStore ? false : 120,
      includeDrafts,
      cache: includeDrafts || devPublishedNoStore ? "no-store" : undefined,
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
