import type { AppLocale } from "@/constants/i18n";
import { toDatoSiteLocale } from "@/constants/i18n";
import { datocmsFetch, type DatocmsResponse } from "@/infra/datocms/client";
import type { GetProductsIndexPageQuery } from "@/infra/datocms/generated/operations.types";
import { GET_PRODUCTS_INDEX_PAGE } from "@/infra/datocms/queries";
import { cmsPageCanonicalPath } from "@/lib/datocms/cms-page-path";
import { cache } from "react";
import { stripStega } from "react-datocms/stega";

export type ProductsIndexPageReference = NonNullable<
  NonNullable<GetProductsIndexPageQuery["globalSetting"]>["productsPage"]
>;

const loadProductsIndexPage = cache(
  async (
    locale: AppLocale,
    includeDrafts: boolean,
  ): Promise<DatocmsResponse<GetProductsIndexPageQuery>> => {
    const devPublishedNoStore = process.env.NODE_ENV === "development" && !includeDrafts;

    return datocmsFetch<GetProductsIndexPageQuery>({
      query: GET_PRODUCTS_INDEX_PAGE,
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

export async function getProductsIndexPage(
  locale: AppLocale,
  includeDrafts: boolean,
): Promise<ProductsIndexPageReference | null> {
  const result = await loadProductsIndexPage(locale, includeDrafts);
  if ("errors" in result) return null;
  return result.data.globalSetting?.productsPage ?? null;
}

export function productsIndexPath(
  locale: AppLocale,
  page: ProductsIndexPageReference | null | undefined,
): string {
  const slug = page?.slug?.trim();
  return slug ? cmsPageCanonicalPath(slug, locale) : `/${locale}/products`;
}

export function productsIndexLabel(page: ProductsIndexPageReference | null | undefined): string {
  const title = page?.title;
  return title && stripStega(title).trim() ? title : "Products";
}

export { productPagePath } from "@/lib/datocms/product-page-path";
