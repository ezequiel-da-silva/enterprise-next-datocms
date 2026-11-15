import type { StorefrontSelectedOption } from "@/infra/shopify/storefront";

const SIZE_OPTION_NAME = /^(size|tamanho|length|comprimento)$/i;
/** Board length: digits with optional decimals / cm suffix (e.g. 152, 156 cm, 159.5). */
const BOARD_LENGTH_VALUE = /^\s*\d+(\.\d+)?\s*(cm)?\s*$/i;

/**
 * Normalize a length option to a stable URL key (digits + optional decimal).
 * Returns null when the value is not a board length.
 */
export function normalizeCatalogSizeKey(raw: string): string | null {
  const trimmed = raw.trim();
  if (!BOARD_LENGTH_VALUE.test(trimmed)) return null;
  const match = trimmed.match(/\d+(\.\d+)?/);
  return match?.[0] ?? null;
}

/**
 * Extract catalog size keys from Shopify selectedOptions.
 * - Accepts Size/Length/Tamanho/Comprimento option names with length-like values.
 * - Accepts `Title` only when the value is a numeric board length (rejects Default Title, colors).
 */
export function extractCatalogSizesFromOptions(
  optionsList: readonly (readonly StorefrontSelectedOption[])[],
): string[] {
  const keys = new Set<string>();
  for (const options of optionsList) {
    for (const option of options) {
      const name = option.name.trim();
      const value = option.value.trim();
      if (/^default\s+title$/i.test(value)) continue;

      const fromNamed = SIZE_OPTION_NAME.test(name);
      const fromTitleLength = /^title$/i.test(name) && BOARD_LENGTH_VALUE.test(value);
      if (!fromNamed && !fromTitleLength) continue;

      const key = normalizeCatalogSizeKey(value);
      if (key) keys.add(key);
    }
  }
  return [...keys].sort((a, b) => Number.parseFloat(a) - Number.parseFloat(b));
}
