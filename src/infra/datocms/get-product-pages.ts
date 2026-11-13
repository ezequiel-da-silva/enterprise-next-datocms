import type { AppLocale } from "@/constants/i18n";
import { toDatoSiteLocale } from "@/constants/i18n";
import { cdaFetchCache } from "@/infra/datocms/cda-fetch-cache";
import { datocmsFetch } from "@/infra/datocms/client";
import { LIST_PRODUCT_PAGES } from "@/infra/datocms/queries";
import {
  getStorefrontCollectionByHandle,
  getStorefrontProducts,
  getStorefrontProductsByHandles,
  type StorefrontProductImage,
} from "@/infra/shopify/storefront";
import {
  autoSourceCollectionHandle,
  enrichCatalogProducts,
  overlayDatoTitles,
  publishedStorefrontProducts,
  readProductPageCards,
  resolveProductsSectionOptions,
  type ProductPageCard,
  type ProductsListingCatalog,
} from "@/lib/datocms/resolve-products-section";
import {
  readContentListingConfig,
  readContentListingSource,
} from "@/lib/datocms/resolve-content-listing-section";
import { cache } from "react";

type ProductPageRow = {
  title: string | null;
  shopifyHandle: string | null;
  badge: string | null;
  profile: string | null;
  terrain: string | null;
  flex: number | null;
  baseImage: { url: string; alt: string | null; width: number | null; height: number | null } | null;
};

function mapBaseImage(image: ProductPageRow["baseImage"]): StorefrontProductImage | null {
  if (!image) return null;
  const url = image.url?.trim();
  if (!url) return null;
  return {
    url,
    altText: image.alt?.trim() || null,
    width: image.width,
    height: image.height,
  };
}

const loadProductPages = cache(async (locale: AppLocale, includeDrafts: boolean): Promise<ProductPageCard[]> => {
  const result = await datocmsFetch<{ allProductPages: ProductPageRow[] }>({
    query: LIST_PRODUCT_PAGES,
    variables: { locale: toDatoSiteLocale(locale) },
    includeDrafts,
    ...cdaFetchCache({
      includeDrafts,
      tags: ["datocms:product"],
      revalidate: 120,
    }),
  });
  if ("errors" in result) return [];
  return result.data.allProductPages.flatMap((row) => {
    const handle = row.shopifyHandle?.trim();
    if (!handle) return [];
    const badge = row.badge?.trim() || null;
    const profile = row.profile?.trim() || null;
    const terrain = row.terrain?.trim() || null;
    const flex = typeof row.flex === "number" && Number.isFinite(row.flex) ? row.flex : null;
    return [
      {
        handle,
        title: row.title?.trim() || handle,
        badge,
        profile,
        terrain,
        flex,
        baseImage: mapBaseImage(row.baseImage),
      },
    ];
  });
});

/** Cached `product_page` cards (title, badge, specs, baseImage) for catalog enrichment. */
export function getProductPageCards(locale: AppLocale, includeDrafts: boolean): Promise<ProductPageCard[]> {
  return loadProductPages(locale, includeDrafts);
}

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
      const config = readContentListingConfig(block) ?? block;
      if (options.fetchMode === "manual") {
        const selected = readProductPageCards(config, "selectedProducts", "selected_products");
        const products = await getStorefrontProductsByHandles(
          selected.map((page) => page.handle),
          locale,
        );
        // Badge/base from LIST_PRODUCT_PAGES; titles prefer the manual link labels.
        return [block.id, overlayDatoTitles(enrichCatalogProducts(products, pages), selected)] as const;
      }

      if (options.filterDisplay === "selected") {
        const collectionHandle = autoSourceCollectionHandle(config, options.filterDisplay);
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
