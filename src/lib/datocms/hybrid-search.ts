import type { SearchHit, SearchResultsPayload } from "@/lib/datocms/search-hit";

export const PREVIEW_PRODUCT_LIMIT = 4;
export const PREVIEW_EDITORIAL_LIMIT = 3;

type BuildPreviewSearchPayloadInput = {
  products: SearchHit[];
  editorial: SearchHit[];
  /** Set when Shopify predictive failed (rejected / threw). */
  productsFailed?: boolean;
  /** Set when Dato editorial failed. */
  editorialFailed?: boolean;
  productsError?: string;
  editorialError?: string;
};

/**
 * Header preview payload: Shopify products first (max 4), then Dato editorial (max 3).
 * `error` only when both sides failed to produce usable data.
 */
export function buildPreviewSearchPayload(input: BuildPreviewSearchPayloadInput): SearchResultsPayload {
  const productHits = input.products
    .filter((hit) => hit.kind === "product" && hit.product)
    .slice(0, PREVIEW_PRODUCT_LIMIT);
  const editorialHits = input.editorial
    .filter((hit) => hit.kind !== "product")
    .slice(0, PREVIEW_EDITORIAL_LIMIT);

  const hits = [...productHits, ...editorialHits];
  const bothFailed = Boolean(input.productsFailed) && Boolean(input.editorialFailed);
  if (bothFailed && hits.length === 0) {
    const message = input.productsError || input.editorialError || "unavailable";
    return { hits: [], error: message };
  }

  return { hits };
}
