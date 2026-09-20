/**
 * Opções específicas de Shopify no `content_listing_section`.
 *
 * | Campo              | API key             | Default                         |
 * |--------------------|---------------------|---------------------------------|
 * | listing_config.fetch_mode | fetch_mode     | auto                            |
 * | listing_config.collection_filter | collection_filter | auto: all (catálogo) ou selected |
 * | listing_config.source_collection | source_collection | só com collection_filter=selected |
 * | listing_config.selected_products | selected_products | só no modo manual       |
 * | has_limit          | has_limit           | false — `limit` só se true      |
 * | limit              | limit               | 6 (clamp 1–100)                 |
 * | display_type       | display_type        | grid                            |
 * | initial_count      | initial_count       | 6 — paginação / load more       |
 * | load_more_step     | load_more_step      | 3                               |
 * | load_more_label    | load_more_label     | copy i18n se vazio              |
 * | carousel_options   | carousel_options    | defaults de `carousel_setting`  |
 * | text_header_section| text_header_section | title / description / âncora    |
 *
 * Shopify auto all (`collection_filter=all`): product_page publicados ∩ Storefront.
 * Shopify selected: coleção Shopify ∩ product_page; sem coleção → lista vazia.
 * Manual: ordem dos links `selected_products`.
 */
import type { StorefrontCollectionProduct } from "@/infra/shopify/storefront";
import { readCdaArray, readCdaString, readCdaStringForLogic } from "@/lib/datocms/cda-field";
import {
  CONTENT_LISTING_DEFAULTS,
  readContentListingFilterDisplay,
  resolveContentListingOptions,
  type ContentListingDisplayType,
  type ContentListingFetchMode,
  type ContentListingFilterDisplay,
} from "@/lib/datocms/resolve-content-listing-section";
import type { CarouselSetting } from "@/lib/datocms/resolve-carousel-setting";

export type ProductsFetchMode = ContentListingFetchMode;
export type ProductsDisplayType = ContentListingDisplayType;

export type ProductsSectionOptions = {
  fetchMode: ProductsFetchMode;
  filterDisplay: ContentListingFilterDisplay;
  hasLimit: boolean;
  limit: number;
  displayType: ProductsDisplayType;
  initialCount: number;
  loadMoreStep: number;
  loadMoreLabel: string;
  carousel: CarouselSetting;
};

export const PRODUCTS_SECTION_DEFAULTS = {
  fetchMode: CONTENT_LISTING_DEFAULTS.fetchMode,
  filterDisplay: CONTENT_LISTING_DEFAULTS.filterDisplay,
  hasLimit: CONTENT_LISTING_DEFAULTS.hasLimit,
  limit: CONTENT_LISTING_DEFAULTS.limit,
  displayType: CONTENT_LISTING_DEFAULTS.displayType,
  initialCount: CONTENT_LISTING_DEFAULTS.initialCount,
  loadMoreStep: CONTENT_LISTING_DEFAULTS.loadMoreStep,
} as const satisfies Omit<ProductsSectionOptions, "loadMoreLabel" | "carousel">;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

export function resolveProductsSectionOptions(
  record: Record<string, unknown>,
  fallbackLoadMoreLabel = "Load more products",
): ProductsSectionOptions {
  const shared = resolveContentListingOptions(record, fallbackLoadMoreLabel);

  return {
    fetchMode: shared.fetchMode,
    filterDisplay: readContentListingFilterDisplay(record),
    hasLimit: shared.hasLimit,
    limit: shared.limit,
    displayType: shared.displayType,
    initialCount: shared.initialCount,
    loadMoreStep: shared.loadMoreStep,
    loadMoreLabel: shared.loadMoreLabel,
    carousel: shared.carousel,
  };
}

export type ProductPageCard = {
  handle: string;
  title: string;
};

export type ProductsListingCatalog = Record<string, StorefrontCollectionProduct[]>;

export function readProductPageCards(record: Record<string, unknown>, camel: string, snake: string): ProductPageCard[] {
  const out: ProductPageCard[] = [];
  for (const item of readCdaArray<Record<string, unknown>>(record, camel, snake)) {
    if (!isRecord(item)) continue;
    const handle =
      readCdaStringForLogic(item, "shopifyHandle", "shopify_handle") ||
      readCdaStringForLogic(item, "handle", "handle");
    if (!handle) continue;
    const title = readCdaString(item, "title", "title") || handle;
    out.push({ handle, title });
  }
  return out;
}

export function autoSourceCollectionHandle(
  record: Record<string, unknown>,
  filterDisplay: ContentListingFilterDisplay,
): string | null {
  if (filterDisplay !== "selected") return null;
  return readSourceCollectionHandle(record);
}

export function readSourceCollectionHandle(record: Record<string, unknown>): string | null {
  const raw = record.sourceCollection ?? record.source_collection;
  if (Array.isArray(raw)) {
    const first = raw[0];
    return isRecord(first)
      ? readCdaStringForLogic(first, "shopifyHandle", "shopify_handle") || null
      : null;
  }
  if (!isRecord(raw)) return null;
  return readCdaStringForLogic(raw, "shopifyHandle", "shopify_handle") || null;
}

export function applyProductLimit(
  products: StorefrontCollectionProduct[],
  hasLimit: boolean,
  limit: number,
  displayType: ProductsDisplayType,
): StorefrontCollectionProduct[] {
  if (displayType === "pagination" || displayType === "load_more") return products;
  if (!hasLimit) return products;
  return products.slice(0, Math.max(1, Math.min(100, limit)));
}

export function overlayDatoTitles(
  products: StorefrontCollectionProduct[],
  pages: ProductPageCard[],
): StorefrontCollectionProduct[] {
  if (pages.length === 0) return products;
  const titles = new Map(pages.map((page) => [page.handle, page.title]));
  return products.map((product) => {
    const title = titles.get(product.handle)?.trim();
    return title ? { ...product, title } : product;
  });
}

/** Só produtos com ficha `product_page`, para o card não apontar a um PDP 404. */
export function publishedStorefrontProducts(
  products: StorefrontCollectionProduct[],
  pages: ProductPageCard[],
): StorefrontCollectionProduct[] {
  if (pages.length === 0) return [];
  const allowed = new Set(pages.map((page) => page.handle));
  return overlayDatoTitles(
    products.filter((product) => allowed.has(product.handle)),
    pages,
  );
}
