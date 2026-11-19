import "@/core/zod-jitless";
import { z } from "zod";

export const RECENTLY_VIEWED_STORAGE_KEY = "nd-recently-viewed";
export const RECENTLY_VIEWED_CHANGE_EVENT = "nd:recently-viewed-change";
export const RECENTLY_VIEWED_MAX = 8;

const EMPTY: string[] = [];

const handlesSchema = z.array(z.string().trim().min(1).max(200)).max(RECENTLY_VIEWED_MAX);

/** Client cache for `useSyncExternalStore`. */
let clientSnapshot: string[] = EMPTY;
let clientHydrated = false;

function parseHandlesRaw(): string[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = handlesSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return EMPTY;
    const unique: string[] = [];
    for (const handle of parsed.data) {
      if (!unique.includes(handle)) unique.push(handle);
    }
    return unique.length === 0 ? EMPTY : unique;
  } catch {
    return EMPTY;
  }
}

function notifyChange(): void {
  if (typeof window === "undefined" || typeof window.dispatchEvent !== "function") return;
  window.dispatchEvent(new Event(RECENTLY_VIEWED_CHANGE_EVENT));
}

/** SSR-safe read from `localStorage`. */
export function readRecentlyViewed(): string[] {
  return parseHandlesRaw();
}

export function getRecentlyViewedSnapshot(): string[] {
  if (typeof window === "undefined") return EMPTY;
  if (!clientHydrated) {
    clientSnapshot = parseHandlesRaw();
    clientHydrated = true;
  }
  return clientSnapshot;
}

export function getRecentlyViewedServerSnapshot(): string[] {
  return EMPTY;
}

export function subscribeRecentlyViewed(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;

  const onStorage = (event: StorageEvent) => {
    if (event.key !== RECENTLY_VIEWED_STORAGE_KEY && event.key !== null) return;
    clientSnapshot = parseHandlesRaw();
    clientHydrated = true;
    onStoreChange();
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(RECENTLY_VIEWED_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(RECENTLY_VIEWED_CHANGE_EVENT, onStoreChange);
  };
}

function writeHandles(handles: string[]): string[] {
  const next = handles.slice(0, RECENTLY_VIEWED_MAX);
  const snapshot = next.length === 0 ? EMPTY : next;
  if (typeof window === "undefined") return snapshot;
  clientSnapshot = snapshot;
  clientHydrated = true;
  try {
    window.localStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    /* quota / private mode — keep in-memory */
  }
  notifyChange();
  return snapshot;
}

/**
 * Push a product handle to the front of the ring (deduped, max {@link RECENTLY_VIEWED_MAX}).
 * Newest first.
 */
export function pushRecentlyViewed(handle: string): string[] {
  const normalized = handle.trim();
  if (!normalized || normalized.length > 200) return getRecentlyViewedSnapshot();
  const without = readRecentlyViewed().filter((entry) => entry !== normalized);
  return writeHandles([normalized, ...without]);
}

/** Test helper — clears the client cache between stubs. */
export function resetRecentlyViewedClientCache(): void {
  clientSnapshot = EMPTY;
  clientHydrated = false;
}
