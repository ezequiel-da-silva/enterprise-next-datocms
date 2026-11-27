import type { CartCopy } from "@/lib/i18n/cart-copy";

/**
 * Cart strings safe to pass into Client Components (no functions —
 * `linkLabel` / `freeShippingRemaining` stay on the server).
 */
export type CartDrawerCopy = Omit<CartCopy, "linkLabel" | "freeShippingRemaining">;

export function toCartDrawerCopy(copy: CartCopy): CartDrawerCopy {
  return {
    title: copy.title,
    addToCart: copy.addToCart,
    adding: copy.adding,
    added: copy.added,
    viewCart: copy.viewCart,
    soldOut: copy.soldOut,
    errorGeneric: copy.errorGeneric,
    errorRateLimit: copy.errorRateLimit,
    empty: copy.empty,
    continueShopping: copy.continueShopping,
    quantity: copy.quantity,
    each: copy.each,
    update: copy.update,
    remove: copy.remove,
    subtotal: copy.subtotal,
    checkout: copy.checkout,
    checkoutNote: copy.checkoutNote,
    checkoutUnavailable: copy.checkoutUnavailable,
    closeDrawer: copy.closeDrawer,
    freeShippingRemainingTemplate: copy.freeShippingRemainingTemplate,
    freeShippingUnlocked: copy.freeShippingUnlocked,
    recentlyViewedTitle: copy.recentlyViewedTitle,
    itemCountOne: copy.itemCountOne,
    itemCountOther: copy.itemCountOther,
  };
}
