import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getRecentlyViewedSnapshot,
  pushRecentlyViewed,
  readRecentlyViewed,
  RECENTLY_VIEWED_MAX,
  RECENTLY_VIEWED_STORAGE_KEY,
  resetRecentlyViewedClientCache,
} from "@/lib/shopify/recently-viewed";

const store = new Map<string, string>();

beforeEach(() => {
  store.clear();
  resetRecentlyViewedClientCache();
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
    },
    dispatchEvent: () => true,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  resetRecentlyViewedClientCache();
});

describe("recently-viewed", () => {
  it("pushes newest first and dedupes", () => {
    pushRecentlyViewed("a");
    pushRecentlyViewed("b");
    pushRecentlyViewed("a");
    expect(readRecentlyViewed()).toEqual(["a", "b"]);
  });

  it(`caps the ring at ${RECENTLY_VIEWED_MAX}`, () => {
    for (let i = 0; i < RECENTLY_VIEWED_MAX + 3; i += 1) {
      pushRecentlyViewed(`h${i}`);
    }
    const handles = readRecentlyViewed();
    expect(handles).toHaveLength(RECENTLY_VIEWED_MAX);
    expect(handles[0]).toBe(`h${RECENTLY_VIEWED_MAX + 2}`);
    expect(handles.at(-1)).toBe("h3");
  });

  it("ignores empty handles", () => {
    pushRecentlyViewed("  ");
    expect(readRecentlyViewed()).toEqual([]);
  });

  it("hydrates the client snapshot from storage", () => {
    store.set(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(["x", "y"]));
    expect(getRecentlyViewedSnapshot()).toEqual(["x", "y"]);
  });
});
