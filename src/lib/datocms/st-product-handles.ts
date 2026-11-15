import { stripStega } from "react-datocms/stega";

type StructuredTextWithLinks = { links?: unknown } | null | undefined;

/**
 * Unique, non-empty `shopifyHandle`s of `ProductPageRecord` entries referenced by a Structured Text
 * (`links` as returned by the CDA). Other record types and scalar `links` (ID strings) are ignored.
 *
 * Note: Dato only exposes `ProductPageRecord` in `links` when the field's `structured_text_links`
 * validator allows `product_page` (then add `... on ProductPageRecord { shopifyHandle title }` to the
 * query fragment).
 */
export function collectStructuredTextProductHandles(data: StructuredTextWithLinks): string[] {
  const links = data?.links;
  if (!Array.isArray(links)) return [];
  const handles = new Set<string>();
  for (const link of links) {
    if (!link || typeof link !== "object") continue;
    const record = link as Record<string, unknown>;
    if (record.__typename !== "ProductPageRecord") continue;
    const raw = typeof record.shopifyHandle === "string" ? stripStega(record.shopifyHandle).trim() : "";
    if (raw) handles.add(raw);
  }
  return [...handles];
}
