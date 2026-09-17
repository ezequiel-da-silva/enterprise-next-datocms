/** Coleções da vitrine Shopify — não viram `collection_page`. */
const SKIP_COLLECTION_HANDLES = new Set(["frontpage", "home-page"]);

export function shouldSkipShopifyCollectionHandle(handle: string): boolean {
  return SKIP_COLLECTION_HANDLES.has(handle.trim().toLowerCase());
}
