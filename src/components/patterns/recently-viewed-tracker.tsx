"use client";

import { pushRecentlyViewed } from "@/lib/shopify/recently-viewed";
import { useEffect } from "react";

type RecentlyViewedTrackerProps = {
  handle: string;
};

/** Records the PDP handle in localStorage on mount (client-only). */
export function RecentlyViewedTracker({ handle }: RecentlyViewedTrackerProps) {
  useEffect(() => {
    pushRecentlyViewed(handle);
  }, [handle]);

  return null;
}
