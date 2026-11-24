import type { AppLocale } from "@/constants/i18n";
import { formatStorefrontMoney } from "@/lib/shopify/format-money";

const LABELS: Record<AppLocale, (percent: number, amount: string) => string> = {
  en: (percent, amount) => `${percent}% OFF with Pix · ${amount}`,
  pt: (percent, amount) => `${percent}% OFF no Pix · ${amount}`,
  es: (percent, amount) => `${percent}% OFF con Pix · ${amount}`,
};

/**
 * Indicative Pix cash-discount line for the BR buy box.
 * `null` when percent/price are missing or invalid — never invents a CMS-empty rate.
 */
export function formatPixHint(
  locale: AppLocale,
  amount: number,
  currency: string,
  percent: number | null | undefined,
): string | null {
  if (
    percent == null ||
    !Number.isInteger(percent) ||
    percent < 1 ||
    percent > 20 ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return null;
  }
  const discounted = amount * (1 - percent / 100);
  if (!Number.isFinite(discounted) || discounted <= 0) return null;
  const formatted = formatStorefrontMoney(locale, discounted.toFixed(2), currency);
  return LABELS[locale](percent, formatted);
}
