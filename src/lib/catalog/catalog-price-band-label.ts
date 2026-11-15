import type { AppLocale } from "@/constants/i18n";
import { catalogPriceBandBounds, type CatalogPriceBand } from "@/lib/catalog/catalog-filters";

function formatWhole(locale: AppLocale, amount: number, currencyCode: string): string {
  const tag = locale === "pt" ? "pt-BR" : locale;
  try {
    return new Intl.NumberFormat(tag, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} ${currencyCode}`;
  }
}

/** Facet label for a price band in the catalog currency, e.g. `R$ 1.000+` or `$200 – $500`. */
export function formatCatalogPriceBandLabel(
  locale: AppLocale,
  band: CatalogPriceBand,
  currencyCode: string,
): string {
  const { min, max } = catalogPriceBandBounds(band, currencyCode);
  if (max == null) return `${formatWhole(locale, min, currencyCode)}+`;
  return `${formatWhole(locale, min, currencyCode)} – ${formatWhole(locale, max, currencyCode)}`;
}
