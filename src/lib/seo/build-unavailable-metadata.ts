import type { Metadata } from "next";

/**
 * Metadata when CMS fetch fails or record is missing.
 * Never invent a canonical; keep the page out of the index.
 */
export function buildUnavailableMetadata(title: string): Metadata {
  return {
    title,
    robots: { index: false, follow: false },
  };
}
