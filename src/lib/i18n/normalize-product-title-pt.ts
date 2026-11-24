/**
 * Commercial PT-BR product title from Shopify handle + English title.
 * Taxonomy translated; proper names kept. Never “placa” / “A coleção de snowboards”.
 *
 * Prefer `shopify_handle` when it matches snowboard catalog patterns — EN titles in CMS
 * can carry editorial noise (e.g. trailing “snow” / “wind”).
 */

const COLECAO_ALREADY = /^coleção\s+snowboard\s*:/i;
const PRANCHA_ALREADY = /^prancha\s+de\s+snowboard\s*:/i;
const ROBOTIC_COLECAO = /^a\s+coleção\s+de\s+snowboards?\s*:?\s*/i;
const COLLECTION_PREFIX = /^the\s+collection\s+snowboard\s*:\s*/i;
const THE_SNOWBOARD_PREFIX = /^the\s+(.+?)\s+snowboard$/i;
const SNOWBOARD_SUFFIX = /\s+snowboard$/i;

function collapseWs(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function titleCaseWords(slugOrPhrase: string): string {
  return collapseWs(slugOrPhrase.replace(/-/g, " "))
    .split(" ")
    .filter(Boolean)
    .map((word) => {
      if (/^\d/.test(word)) return word;
      if (word.toLowerCase() === "3p") return "3p";
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ")
    .replace(/\bAt\b/g, "at")
    .replace(/\bOf\b/g, "of")
    .replace(/\bNot\b/g, "Not");
}

/** Handle → PT title when the slug is a known snowboard pattern. */
export function productTitlePtFromHandle(handle: string | null | undefined): string | null {
  if (!handle?.trim()) return null;
  const h = handle.trim().toLowerCase();

  const collection = /^the-collection-snowboard-(.+)$/.exec(h);
  if (collection?.[1]) {
    return `Coleção Snowboard: ${titleCaseWords(collection[1])}`;
  }

  const board = /^the-(.+)-snowboard$/.exec(h);
  if (board?.[1]) {
    return `Prancha de Snowboard: ${titleCaseWords(board[1])}`;
  }

  return null;
}

function scrubPtNoise(title: string): string {
  let next = collapseWs(title);
  next = next.replace(ROBOTIC_COLECAO, "");
  next = next.replace(/\bplacas?\b/gi, "prancha");
  return collapseWs(next);
}

function fromEnglishTitle(enTitle: string): string | null {
  const en = collapseWs(enTitle);
  if (!en) return null;

  const collectionMatch = en.match(COLLECTION_PREFIX);
  if (collectionMatch) {
    const proper = collapseWs(en.slice(collectionMatch[0].length));
    // Drop a single trailing junk token when the rest looks like a proper name (e.g. "Liquid snow")
    const parts = proper.split(" ");
    const cleaned =
      parts.length === 2 && parts[1].length <= 5 && !/^[A-Z]/.test(parts[1])
        ? parts[0]
        : proper;
    if (!cleaned) return "Coleção Snowboard";
    return `Coleção Snowboard: ${cleaned}`;
  }

  const theBoard = en.match(THE_SNOWBOARD_PREFIX);
  if (theBoard?.[1]) {
    return `Prancha de Snowboard: ${collapseWs(theBoard[1])}`;
  }

  if (SNOWBOARD_SUFFIX.test(en) || /\bsnowboard\b/i.test(en)) {
    let proper = en.replace(/^the\s+/i, "");
    proper = proper.replace(SNOWBOARD_SUFFIX, "");
    proper = collapseWs(proper.replace(/:$/, ""));
    if (!proper) return "Prancha de Snowboard";
    return `Prancha de Snowboard: ${proper}`;
  }

  return null;
}

/**
 * Returns the desired `pt-BR` title, or `null` when there is no snowboard signal
 * (gift cards, wax, etc.) — caller should leave those alone.
 */
export function normalizeProductTitlePt(
  enTitle: string,
  currentPt?: string | null,
  handle?: string | null,
): string | null {
  const ptExisting = currentPt ? scrubPtNoise(currentPt) : "";

  if (COLECAO_ALREADY.test(ptExisting) || PRANCHA_ALREADY.test(ptExisting)) {
    return ptExisting;
  }

  const fromHandle = productTitlePtFromHandle(handle);
  if (fromHandle) return fromHandle;

  const fromEn = fromEnglishTitle(enTitle);
  if (fromEn) return fromEn;

  if (ptExisting && ROBOTIC_COLECAO.test(collapseWs(currentPt ?? ""))) {
    const rest = scrubPtNoise(currentPt ?? "");
    return rest ? `Coleção Snowboard: ${rest}` : "Coleção Snowboard";
  }

  return null;
}

/** True when `currentPt` should be replaced with `desired`. */
export function productTitlePtNeedsUpdate(currentPt: string | null | undefined, desired: string | null): boolean {
  if (!desired) return false;
  const current = collapseWs(currentPt ?? "");
  return current !== desired;
}
