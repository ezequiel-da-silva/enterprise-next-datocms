"use client";

import { useParams } from "next/navigation";

import { loadingLabelFor } from "@/lib/i18n/loading-copy";

/** Localized "Loading…" text for `loading.tsx` fallbacks, which receive no params. */
export function RouteLoadingLabel() {
  const params = useParams<{ slug?: string }>();
  return <span className="sr-only">{loadingLabelFor(params?.slug)}</span>;
}
