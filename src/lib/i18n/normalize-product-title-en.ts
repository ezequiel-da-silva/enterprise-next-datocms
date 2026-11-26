/**
 * Clean English `product_page.title` noise without changing snowboard taxonomy.
 * Drops a single trailing junk token on proper names (e.g. "Liquid snow" → "Liquid").
 * Does not translate or rewrite "The Collection Snowboard: …" prefixes.
 */

function collapseWs(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

const COLLECTION_PREFIX = /^the\s+collection\s+snowboard\s*:\s*/i;

/**
 * Desired EN title, or `null` when no scrub is needed / no snowboard signal.
 */
export function normalizeProductTitleEn(currentEn: string | null | undefined): string | null {
  const en = collapseWs(currentEn ?? "");
  if (!en) return null;

  const collectionMatch = en.match(COLLECTION_PREFIX);
  if (collectionMatch) {
    const prefix = en.slice(0, collectionMatch[0].length);
    const proper = collapseWs(en.slice(collectionMatch[0].length));
    const parts = proper.split(" ").filter(Boolean);
    const cleaned =
      parts.length === 2 && parts[1].length <= 5 && !/^[A-Z]/.test(parts[1])
        ? parts[0]
        : proper;
    if (!cleaned) return collapseWs(`${prefix}`.replace(/:\s*$/, "")) || null;
    const desired = collapseWs(`${prefix}${cleaned}`);
    return desired === en ? en : desired;
  }

  // Generic: trailing short lowercase junk after a multi-word title (e.g. "Foo Bar snow")
  const parts = en.split(" ").filter(Boolean);
  if (
    parts.length >= 2 &&
    parts[parts.length - 1].length <= 5 &&
    !/^[A-Z]/.test(parts[parts.length - 1]) &&
    /\bsnowboard\b/i.test(en)
  ) {
    const withoutJunk = collapseWs(parts.slice(0, -1).join(" "));
    return withoutJunk || null;
  }

  return en;
}

/** True when `currentEn` should be replaced with `desired`. */
export function productTitleEnNeedsUpdate(
  currentEn: string | null | undefined,
  desired: string | null,
): boolean {
  if (!desired) return false;
  return collapseWs(currentEn ?? "") !== desired;
}
