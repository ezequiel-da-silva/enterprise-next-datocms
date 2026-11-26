/**
 * Hoisted to `<head>` by React 19. No `crossorigin`: the product `<img>` is a no-cors
 * request, and a CORS preconnect would not be reused for it.
 */
export function ShopifyCdnPreconnect() {
  return <link rel="preconnect" href="https://cdn.shopify.com" />;
}
