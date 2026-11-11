import "@/core/zod-jitless";
import { z } from "zod";
import {
  EMPTY_WISHLIST,
  WISHLIST_CHANGE_EVENT,
  WISHLIST_MAX_ITEMS,
  WISHLIST_STORAGE_KEY,
  type WishlistItem,
} from "@/lib/wishlist/types";

const wishlistItemSchema = z.object({
  handle: z.string().trim().min(1).max(200),
  title: z.string().trim().min(1).max(300),
  imageUrl: z.string().trim().url().nullable().catch(null),
  priceAmount: z.string().trim().min(1).max(40),
  currencyCode: z.string().trim().min(1).max(8),
  savedAt: z.number().finite().nonnegative(),
});

const wishlistSchema = z.array(wishlistItemSchema).max(WISHLIST_MAX_ITEMS);

/** Client cache for `useSyncExternalStore` (quota-safe + stable refs until mutate). */
let clientSnapshot: WishlistItem[] = EMPTY_WISHLIST;
let clientHydrated = false;

function sortNewestFirst(items: WishlistItem[]): WishlistItem[] {
  return [...items].sort((a, b) => b.savedAt - a.savedAt);
}

function parseWishlistRaw(): WishlistItem[] {
  if (typeof window === "undefined") return EMPTY_WISHLIST;
  try {
    const raw = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) return EMPTY_WISHLIST;
    const parsed = wishlistSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return EMPTY_WISHLIST;
    const next = sortNewestFirst(parsed.data);
    return next.length === 0 ? EMPTY_WISHLIST : next;
  } catch {
    return EMPTY_WISHLIST;
  }
}

function notifyWishlistChange(): void {
  if (typeof window === "undefined" || typeof window.dispatchEvent !== "function") return;
  window.dispatchEvent(new Event(WISHLIST_CHANGE_EVENT));
}

/** SSR-safe read straight from `localStorage` (tests + imperative callers). */
export function readWishlist(): WishlistItem[] {
  return parseWishlistRaw();
}

/** `useSyncExternalStore` client snapshot. */
export function getWishlistSnapshot(): WishlistItem[] {
  if (typeof window === "undefined") return EMPTY_WISHLIST;
  if (!clientHydrated) {
    clientSnapshot = parseWishlistRaw();
    clientHydrated = true;
  }
  return clientSnapshot;
}

/** `useSyncExternalStore` server / hydration snapshot. */
export function getWishlistServerSnapshot(): WishlistItem[] {
  return EMPTY_WISHLIST;
}

/** Subscribe to same-tab writes and cross-tab `storage` events. */
export function subscribeWishlist(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;

  const onStorage = (event: StorageEvent) => {
    if (event.key !== WISHLIST_STORAGE_KEY && event.key !== null) return;
    clientSnapshot = parseWishlistRaw();
    clientHydrated = true;
    onStoreChange();
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(WISHLIST_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(WISHLIST_CHANGE_EVENT, onStoreChange);
  };
}

/** SSR-safe write; trims to `WISHLIST_MAX_ITEMS` (newest kept). */
export function writeWishlist(items: WishlistItem[]): WishlistItem[] {
  const next = sortNewestFirst(items).slice(0, WISHLIST_MAX_ITEMS);
  const snapshot = next.length === 0 ? EMPTY_WISHLIST : next;
  if (typeof window === "undefined") return snapshot;
  clientSnapshot = snapshot;
  clientHydrated = true;
  try {
    window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    /* quota / private mode — keep in-memory snapshot */
  }
  notifyWishlistChange();
  return snapshot;
}

export function upsertWishlistItem(items: WishlistItem[], item: WishlistItem): WishlistItem[] {
  const without = items.filter((entry) => entry.handle !== item.handle);
  return writeWishlist([{ ...item, savedAt: item.savedAt || Date.now() }, ...without]);
}

export function removeWishlistHandle(items: WishlistItem[], handle: string): WishlistItem[] {
  return writeWishlist(items.filter((entry) => entry.handle !== handle));
}

/** Test helper — clears the client cache between stubs. */
export function resetWishlistClientCache(): void {
  clientSnapshot = EMPTY_WISHLIST;
  clientHydrated = false;
}
