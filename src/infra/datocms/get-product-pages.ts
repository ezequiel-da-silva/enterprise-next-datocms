import type { AppLocale } from "@/constants/i18n";
import { toDatoSiteLocale } from "@/constants/i18n";
import { datocmsFetch } from "@/infra/datocms/client";
import { LIST_PRODUCT_PAGES } from "@/infra/datocms/queries";
import {
  getStorefrontCollectionByHandle,
  getStorefrontProducts,
  getStorefrontProductsByHandles,
} from "@/infra/shopify/storefront";
import {
  autoSourceCollectionHandle,
  overlayDatoTitles,
  publishedStorefrontProducts,
  readProductPageCards,
  resolveProductsSectionOptions,
  type ProductPageCard,
  type ProductsListingCatalog,
} from "@/lib/datocms/resolve-products-section";
import { readContentListingSource } from "@/lib/datocms/resolve-content-listing-section";
import { cache } from "react";

type ProductPageRow = { title: string | null; shopifyHandle: string | null };

const loadProductPages = cache(async (locale: AppLocale, includeDrafts: boolean): Promise<ProductPageCard[]> => {
  const devPublishedNoStore = process.env.NODE_ENV === "development" && !includeDrafts;
  const result = await datocmsFetch<{ allProductPages: ProductPageRow[] }>({
    query: LIST_PRODUCT_PAGES,
    variables: { locale: toDatoSiteLocale(locale) },
    tags: includeDrafts || devPublishedNoStore ? undefined : ["datocms:product"],
    revalidate: includeDrafts || devPublishedNoStore ? false : 120,
    includeDrafts,
    cache: includeDrafts || devPublishedNoStore ? "no-store" : undefined,
  });
  if ("errors" in result) return [];
  return result.data.allProductPages.flatMap((row) => {
    const handle = row.shopifyHandle?.trim();
    if (!handle) return [];
    return [{ handle, title: row.title?.trim() || handle }];
  });
});

export async function loadProductsListingCatalog(
  blocks: ({ id: string; __typename?: string } & Record<string, unknown>)[],
  locale: AppLocale,
  includeDrafts: boolean,
): Promise<ProductsListingCatalog> {
  const listings = blocks.filter(
    (block) =>
      block.__typename === "ContentListingSectionRecord" &&
      readContentListingSource(block) === "shopify",
  );
  if (listings.length === 0) return {};

  const pages = await loadProductPages(locale, includeDrafts);
  const entries = await Promise.all(
    listings.map(async (block) => {
      const options = resolveProductsSectionOptions(block);
      if (options.fetchMode === "manual") {
        const selected = readProductPageCards(block, "selectedProducts", "selected_products");
        const products = await getStorefrontProductsByHandles(
          selected.map((page) => page.handle),
          locale,
        );
        return [block.id, overlayDatoTitles(products, selected)] as const;
      }

      if (options.filterDisplay === "selected") {
        const collectionHandle = autoSourceCollectionHandle(block, options.filterDisplay);
        if (!collectionHandle) return [block.id, []] as const;
        const collection = await getStorefrontCollectionByHandle(collectionHandle, locale);
        return [block.id, publishedStorefrontProducts(collection?.products ?? [], pages)] as const;
      }

      const products = await getStorefrontProducts(locale);
      return [block.id, publishedStorefrontProducts(products, pages)] as const;
    }),
  );
  return Object.fromEntries(entries);
}

export function contentNeedsProductsCatalog(
  blocks: ({ __typename?: string } & Record<string, unknown>)[],
): boolean {
  return blocks.some(
    (block) =>
      block.__typename === "ContentListingSectionRecord" &&
      readContentListingSource(block) === "shopify",
  );
}
