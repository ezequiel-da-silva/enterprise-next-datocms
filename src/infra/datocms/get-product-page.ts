import type { AppLocale } from "@/constants/i18n";
import { toDatoSiteLocale } from "@/constants/i18n";
import { cdaFetchCache } from "@/infra/datocms/cda-fetch-cache";
import { datocmsFetch, type DatocmsResponse } from "@/infra/datocms/client";
import type { ProductPageByHandleQuery } from "@/infra/datocms/generated/operations.types";
import { PRODUCT_PAGE_BY_HANDLE } from "@/infra/datocms/queries";
import { cache } from "react";

const loadProductPage = cache(
  async (
    locale: AppLocale,
    handle: string,
    includeDrafts: boolean,
  ): Promise<DatocmsResponse<ProductPageByHandleQuery>> => {
    return datocmsFetch<ProductPageByHandleQuery>({
      query: PRODUCT_PAGE_BY_HANDLE,
      variables: { locale: toDatoSiteLocale(locale), handle },
      includeDrafts,
      ...cdaFetchCache({
        includeDrafts,
        tags: ["datocms:product", `product:${handle}`],
        revalidate: 120,
        bypassPublishedCacheInDev: true,
      }),
    });
  },
);

export function getProductPageByHandle(
  locale: AppLocale,
  handle: string,
  includeDrafts: boolean,
): Promise<DatocmsResponse<ProductPageByHandleQuery>> {
  return loadProductPage(locale, handle, includeDrafts);
}
