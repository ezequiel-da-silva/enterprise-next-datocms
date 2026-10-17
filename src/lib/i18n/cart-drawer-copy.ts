import type { CartCopy } from "@/lib/i18n/cart-copy";

/** Cart strings safe to pass into Client Components (no `linkLabel` function). */
export type CartDrawerCopy = Omit<CartCopy, "linkLabel">;

export function toCartDrawerCopy(copy: CartCopy): CartDrawerCopy {
  const { linkLabel: _ignored, ...drawerCopy } = copy;
  return drawerCopy;
}
