import type { AppLocale } from "@/constants/i18n";

export function formatStorefrontMoney(locale: AppLocale, amount: string, currency: string): string {
  const value = Number.parseFloat(amount);
  const tag = locale === "pt" ? "pt-BR" : locale;
  if (!Number.isFinite(value)) return `${amount} ${currency}`;
  try {
    return new Intl.NumberFormat(tag, { style: "currency", currency }).format(value);
  } catch {
    return `${amount} ${currency}`;
  }
}
