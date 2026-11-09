"use client";

import {
  getWishlistServerSnapshot,
  getWishlistSnapshot,
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

function subscribeReady(onStoreChange: () => void): () => void {
  return subscribeWishlist(onStoreChange);
}

function getReadySnapshot(): boolean {
  return true;
}

function getReadyServerSnapshot(): boolean {
  return false;
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribeWishlist, getWishlistSnapshot, getWishlistServerSnapshot);
  const ready = useSyncExternalStore(subscribeReady, getReadySnapshot, getReadyServerSnapshot);

  const has = useCallback((handle: string) => items.some((item) => item.handle === handle), [items]);

  const toggle = useCallback((item: Omit<WishlistItem, "savedAt"> & { savedAt?: number }) => {
    const current = getWishlistSnapshot();
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
    removeWishlistHandle(getWishlistSnapshot(), handle);
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
