"use client";

import {
  getWishlistServerSnapshot,
  getWishlistSnapshot,
  hydrateWishlistFromStorage,
  readWishlist,
  removeWishlistHandle,
  subscribeWishlist,
  upsertWishlistItem,
} from "@/lib/wishlist/storage";
import type { WishlistItem } from "@/lib/wishlist/types";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

type WishlistContextValue = {
  items: WishlistItem[];
  count: number;
  ready: boolean;
  has: (handle: string) => boolean;
  toggle: (item: Omit<WishlistItem, "savedAt"> & { savedAt?: number }) => void;
  remove: (handle: string) => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

/**
 * `false` until `subscribeReady` runs (post-commit). Must match
 * `getReadyServerSnapshot` during the hydration pass.
 */
let readyForClient = false;

function subscribeReady(onStoreChange: () => void): () => void {
  hydrateWishlistFromStorage();
  readyForClient = true;
  const unsubscribe = subscribeWishlist(onStoreChange);
  onStoreChange();
  return () => {
    readyForClient = false;
    unsubscribe();
  };
}

function getReadySnapshot(): boolean {
  return readyForClient;
}

function getReadyServerSnapshot(): boolean {
  return false;
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribeWishlist, getWishlistSnapshot, getWishlistServerSnapshot);
  const ready = useSyncExternalStore(subscribeReady, getReadySnapshot, getReadyServerSnapshot);

  const has = useCallback((handle: string) => items.some((item) => item.handle === handle), [items]);

  const toggle = useCallback((item: Omit<WishlistItem, "savedAt"> & { savedAt?: number }) => {
    const current = readWishlist();
    if (current.some((entry) => entry.handle === item.handle)) {
      removeWishlistHandle(current, item.handle);
      return;
    }
    upsertWishlistItem(current, {
      ...item,
      savedAt: item.savedAt ?? Date.now(),
    });
  }, []);

  const remove = useCallback((handle: string) => {
    removeWishlistHandle(readWishlist(), handle);
  }, []);

  const value = useMemo<WishlistContextValue>(
    () => ({
      items,
      count: items.length,
      ready,
      has,
      toggle,
      remove,
    }),
    [items, ready, has, toggle, remove],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const value = useContext(WishlistContext);
  if (!value) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return value;
}
