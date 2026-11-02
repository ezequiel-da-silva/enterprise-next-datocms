/** Hoisted to `<head>` by React 19. Only mount on routes that render Shopify images. */
export function ShopifyCdnPreconnect() {
  return <link rel="preconnect" href="https://cdn.shopify.com" crossOrigin="anonymous" />;
}
