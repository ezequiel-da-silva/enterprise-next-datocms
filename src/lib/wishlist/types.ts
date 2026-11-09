export type WishlistItem = {
  handle: string;
  title: string;
  imageUrl: string | null;
  priceAmount: string;
  currencyCode: string;
  savedAt: number;
};

export const WISHLIST_STORAGE_KEY = "nd-wishlist";
export const WISHLIST_CHANGE_EVENT = "nd-wishlist-change";
export const WISHLIST_MAX_ITEMS = 50;

/** Stable empty snapshot for SSR / `useSyncExternalStore` server render. */
export const EMPTY_WISHLIST: WishlistItem[] = [];
