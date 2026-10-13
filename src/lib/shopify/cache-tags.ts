/**
 * Next.js cache tags for Storefront catalog reads. The Shopify webhook
 * (`/api/webhooks/shopify`) calls `revalidateTag` with these on stock, product and
 * collection changes; `SHOPIFY_CATALOG_REVALIDATE_SEC` caps staleness if a webhook is lost.
 * The cart is never cached.
 */
export const SHOPIFY_PRODUCTS_TAG = "shopify:products";
export const SHOPIFY_CATALOG_TAG = "shopify:catalog";
export const SHOPIFY_CATALOG_REVALIDATE_SEC = 300;

export function shopifyProductTag(handle: string): string {
  return `shopify:product:${handle.trim().toLowerCase()}`;
}
