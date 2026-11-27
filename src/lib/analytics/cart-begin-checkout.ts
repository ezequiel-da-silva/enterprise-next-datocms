import type { EcommercePayload } from "@/lib/analytics/ecommerce";

/** Minimal cart shape shared by `CartSnapshot` and `StorefrontCart` for GA4 begin_checkout. */
export type CartBeginCheckoutSource = {
  subtotal: { amount: string; currencyCode: string } | null;
  lines: Array<{
    productHandle: string;
    productTitle: string;
    unitPrice: { amount: string };
    quantity: number;
    variantTitle?: string | null;
  }>;
};

/**
 * Builds a GA4 `begin_checkout` payload from a cart snapshot / Storefront cart.
 * Returns `null` when there is no subtotal (nothing useful to report).
 */
export function cartBeginCheckoutPayload(cart: CartBeginCheckoutSource): EcommercePayload | null {
  if (!cart.subtotal) return null;
  return {
    currency: cart.subtotal.currencyCode,
    value: Number(cart.subtotal.amount) || 0,
    items: cart.lines.map((line) => ({
      item_id: line.productHandle,
      item_name: line.productTitle,
      price: Number(line.unitPrice.amount) || 0,
      quantity: line.quantity,
      item_variant: line.variantTitle ?? undefined,
    })),
  };
}
