"use client";

import { useState, useSyncExternalStore } from "react";

type MountStore = {
  subscribe: (onStoreChange: () => void) => () => void;
  getSnapshot: () => boolean;
  getServerSnapshot: () => boolean;
};

function createMountStore(): MountStore {
  let mounted = false;
  return {
    subscribe(onStoreChange) {
      mounted = true;
      onStoreChange();
      return () => {
        mounted = false;
      };
    },
    getSnapshot: () => mounted,
    getServerSnapshot: () => false,
  };
}

/**
 * `false` on the server and during this instance's hydration pass; `true` after
 * subscribe (post-commit). Prefer over `useState` + `useEffect` — avoids
 * `react-hooks/set-state-in-effect` and keeps SSR HTML aligned when the parent
 * provider may already be "ready" (e.g. cards behind `<Suspense>`).
 */
export function useClientMounted(): boolean {
  const [store] = useState(createMountStore);
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}
