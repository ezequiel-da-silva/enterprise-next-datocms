import { afterEach, describe, expect, it, vi } from "vitest";
import {
  readWishlist,
  removeWishlistHandle,
  resetWishlistClientCache,
  upsertWishlistItem,
  writeWishlist,
} from "@/lib/wishlist/storage";
import { WISHLIST_STORAGE_KEY } from "@/lib/wishlist/types";

function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key) => map.get(key) ?? null,
    key: (index) => [...map.keys()][index] ?? null,
    removeItem: (key) => {
      map.delete(key);
    },
    setItem: (key, value) => {
      map.set(key, value);
    },
  };
}

describe("wishlist storage", () => {
  afterEach(() => {
    resetWishlistClientCache();
    vi.unstubAllGlobals();
    Reflect.deleteProperty(globalThis as object, "window");
    Reflect.deleteProperty(globalThis as object, "localStorage");
  });

  it("returns empty without window", () => {
    expect(readWishlist()).toEqual([]);
  });

  it("returns empty for invalid JSON", () => {
    const store = memoryStorage();
    store.setItem(WISHLIST_STORAGE_KEY, "{not-json");
    vi.stubGlobal("window", { localStorage: store });
    vi.stubGlobal("localStorage", store);
    expect(readWishlist()).toEqual([]);
  });

  it("round-trips items and drops oldest beyond the cap via upsert", () => {
    const store = memoryStorage();
    vi.stubGlobal("window", { localStorage: store });
    vi.stubGlobal("localStorage", store);

    const base = {
      title: "Board",
      imageUrl: "https://cdn.example.com/a.jpg",
      priceAmount: "10.00",
      currencyCode: "USD",
    };
    writeWishlist([
      { ...base, handle: "a", savedAt: 1 },
      { ...base, handle: "b", savedAt: 2 },
    ]);
    expect(readWishlist().map((item) => item.handle)).toEqual(["b", "a"]);

    const next = upsertWishlistItem(readWishlist(), { ...base, handle: "c", savedAt: 3 });
    expect(next.map((item) => item.handle)).toEqual(["c", "b", "a"]);

    expect(removeWishlistHandle(next, "b").map((item) => item.handle)).toEqual(["c", "a"]);
  });
});
