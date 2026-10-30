import type { CartSnapshot, CartSnapshotLine } from "@/core/entities/cart";
import type { StorefrontCart, StorefrontCartLine } from "@/infra/shopify/cart";

function mapLine(line: StorefrontCartLine): CartSnapshotLine {
  return {
    id: line.id,
    quantity: line.quantity,
    productTitle: line.productTitle,
    productHandle: line.productHandle,
    variantTitle:
      line.variantTitle && line.variantTitle !== "Default Title" ? line.variantTitle : null,
    unitPrice: { amount: line.unitPrice.amount, currencyCode: line.unitPrice.currencyCode },
    total: { amount: line.total.amount, currencyCode: line.total.currencyCode },
    image: line.image?.url
      ? { url: line.image.url, alt: line.image.altText?.trim() || line.productTitle }
      : null,
  };
}

/** Maps a Storefront cart into a client-safe snapshot for the quick-cart drawer. */
export function toCartSnapshot(cart: StorefrontCart): CartSnapshot {
  return {
    id: cart.id,
    totalQuantity: cart.totalQuantity,
    checkoutUrl: cart.checkoutUrl,
    subtotal: cart.subtotal
      ? { amount: cart.subtotal.amount, currencyCode: cart.subtotal.currencyCode }
      : null,
    lines: cart.lines.map(mapLine),
  };
}
