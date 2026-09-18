import type { AppLocale } from "@/constants/i18n";

/** Dato CMA `pt-BR` / `es` → locales Shopify (Markets BR/ES). */
export const DATO_PT_SHOPIFY_CANDIDATES = ["pt", "pt-BR"] as const;
export const DATO_ES_SHOPIFY_CANDIDATES = ["es", "es-ES"] as const;

/** Storefront `@inContext(country:)` alinhado aos Markets da loja. */
export type ShopifyCountryCode = "US" | "BR" | "ES";

export function shopifyCountryFromLocale(locale: AppLocale): ShopifyCountryCode {
  if (locale === "pt") return "BR";
  if (locale === "es") return "ES";
  return "US";
}

export function pickShopifyLocale(
  shopLocales: readonly string[],
  candidates: readonly string[],
): string | null {
  const published = new Set(shopLocales.map((locale) => locale.trim()).filter(Boolean));
  if (published.size === 0) {
    return candidates[0] ?? null;
  }
  for (const candidate of candidates) {
    if (published.has(candidate)) return candidate;
  }
  return null;
}

export function translationValue(
  rows: Array<{ key?: string; value?: string | null }> | undefined,
  key = "title",
): string | null {
  const match = rows?.find((row) => row.key === key);
  const value = match?.value?.trim();
  return value || null;
}
