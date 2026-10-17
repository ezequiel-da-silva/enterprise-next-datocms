/** Server actions passed from the app layout into the quick-cart drawer (client-safe type). */
export type CartDrawerLineAction = (formData: FormData) => Promise<void>;

export type CartDrawerLineActions = {
  updateLine: CartDrawerLineAction;
  removeLine: CartDrawerLineAction;
};
