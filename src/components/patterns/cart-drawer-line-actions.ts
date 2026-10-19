import type { CartSnapshot } from "@/core/entities/cart";

/** Server actions for the quick-cart drawer (`useActionState` + snapshot refresh). */
export type CartDrawerLineAction = (
  prev: CartSnapshot | null,
  formData: FormData,
) => Promise<CartSnapshot | null>;

export type CartDrawerLineActions = {
  updateLine: CartDrawerLineAction;
  removeLine: CartDrawerLineAction;
};
