import type { AppLocale } from "@/constants/i18n";
import { formatStorefrontMoney } from "@/lib/shopify/format-money";

const LABELS: Record<AppLocale, (count: number, amount: string) => string> = {
  en: (count, amount) => `or ${count}× of ${amount}`,
  pt: (count, amount) => `ou ${count}× de ${amount}`,
  es: (count, amount) => `o ${count}× de ${amount}`,
};

/**
 * Indicative installment line for the buy box.
 * `null` when count/multiplier/price are missing or invalid — never invents rates.
 */
export function formatInstallmentHint(
  locale: AppLocale,
  amount: number,
  currency: string,
  count: number | null | undefined,
  multiplier: number | null | undefined,
): string | null {
  if (
    count == null ||
    multiplier == null ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    !Number.isInteger(count) ||
    count < 2 ||
    count > 12 ||
    !Number.isFinite(multiplier) ||
    multiplier < 1
  ) {
    return null;
  }
  const installment = (amount * multiplier) / count;
  if (!Number.isFinite(installment) || installment <= 0) return null;
  const formatted = formatStorefrontMoney(locale, installment.toFixed(2), currency);
  return LABELS[locale](count, formatted);
}
