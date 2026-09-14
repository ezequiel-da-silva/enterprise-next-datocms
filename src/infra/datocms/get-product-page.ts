import type { AppLocale } from "@/constants/i18n";
import { toDatoSiteLocale } from "@/constants/i18n";
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
    const devPublishedNoStore = process.env.NODE_ENV === "development" && !includeDrafts;

    return datocmsFetch<ProductPageByHandleQuery>({
      query: PRODUCT_PAGE_BY_HANDLE,
      variables: { locale: toDatoSiteLocale(locale), handle },
      tags:
        includeDrafts || devPublishedNoStore
          ? undefined
          : ["datocms:product", `product:${handle}`],
      revalidate: includeDrafts || devPublishedNoStore ? false : 120,
      includeDrafts,
      cache: includeDrafts || devPublishedNoStore ? "no-store" : undefined,
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
