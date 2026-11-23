/**
 * Size-aware variant helpers for listing quick-add.
 * Prefer Size / Length / Tamanho / Comprimento option groups (same as catalog facets).
 */

export type QuickAddVariantOption = {
  name: string;
  value: string;
};

export type QuickAddVariant = {
  id: string;
  availableForSale: boolean;
  selectedOptions: QuickAddVariantOption[];
  price: { amount: string; currencyCode: string };
};

const SIZE_OPTION_NAMES = new Set([
  "size",
  "length",
  "tamanho",
  "comprimento",
  "talla",
  "title",
]);

function normalizeOptionName(name: string): string {
  return name.trim().toLowerCase();
}

/** Prefer a size-like option group; otherwise the first option name across variants. */
export function resolveQuickAddOptionName(variants: readonly QuickAddVariant[]): string | null {
  if (variants.length === 0) return null;
  const names = new Set<string>();
  for (const variant of variants) {
    for (const option of variant.selectedOptions) {
      names.add(option.name);
    }
  }
  for (const name of names) {
    if (SIZE_OPTION_NAMES.has(normalizeOptionName(name))) return name;
  }
  return names.values().next().value ?? null;
}

export function uniqueOptionValues(
  variants: readonly QuickAddVariant[],
  optionName: string,
): string[] {
  const values: string[] = [];
  for (const variant of variants) {
    const match = variant.selectedOptions.find((option) => option.name === optionName);
    if (match && !values.includes(match.value)) values.push(match.value);
  }
  return values;
}

export function findVariantForOption(
  variants: readonly QuickAddVariant[],
  optionName: string,
  value: string,
): QuickAddVariant | null {
  return (
    variants.find((variant) =>
      variant.selectedOptions.some((option) => option.name === optionName && option.value === value),
    ) ?? null
  );
}

export function isOptionValueAvailable(
  variants: readonly QuickAddVariant[],
  optionName: string,
  value: string,
): boolean {
  return variants.some(
    (variant) =>
      variant.availableForSale &&
      variant.selectedOptions.some((option) => option.name === optionName && option.value === value),
  );
}
