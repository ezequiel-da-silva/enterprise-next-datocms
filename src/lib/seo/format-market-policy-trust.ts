import type { AppLocale } from "@/constants/i18n";
import type { MarketPolicy } from "@/lib/seo/merchant-policy";
import type { ShopifyCountryCode } from "@/lib/shopify/locale-map";
import { formatStorefrontMoney } from "@/lib/shopify/format-money";

export type MarketPolicyTrustLines = {
  shipping: string | null;
  returns: string | null;
};

/** Offer currency for each Shopify Market country used by `market_policy`. */
export function currencyForShopifyCountry(country: ShopifyCountryCode): string {
  if (country === "BR") return "BRL";
  if (country === "ES") return "EUR";
  return "USD";
}

function dayRangeLabel(min: number, max: number): string {
  return min === max ? String(min) : `${min}–${max}`;
}

const SHIPPING_COPY: Record<
  AppLocale,
  { free: (days: string) => string; paid: (amount: string, days: string) => string }
> = {
  en: {
    free: (days) => `Free shipping · ${days} business days`,
    paid: (amount, days) => `Shipping from ${amount} · ${days} business days`,
  },
  pt: {
    free: (days) => `Frete grátis · ${days} dias úteis`,
    paid: (amount, days) => `Frete a partir de ${amount} · ${days} dias úteis`,
  },
  es: {
    free: (days) => `Envío gratis · ${days} días laborables`,
    paid: (amount, days) => `Envío desde ${amount} · ${days} días laborables`,
  },
};

const RETURNS_COPY: Record<AppLocale, (days: number) => string> = {
  en: (days) => `Free returns within ${days} days`,
  pt: (days) => `Devolução grátis em até ${days} dias`,
  es: (days) => `Devoluciones gratis en ${days} días`,
};

/**
 * Compact buy-box / cart trust lines from a validated `market_policy`.
 * Omits a line when required fields are missing — never invents rates.
 */
export function formatMarketPolicyTrust(
  locale: AppLocale,
  policy: MarketPolicy | null,
  currency: string,
): MarketPolicyTrustLines {
  if (!policy) return { shipping: null, returns: null };

  let shipping: string | null = null;
  if (policy.shippingRate !== null && policy.handling && policy.transit) {
    const days = `${dayRangeLabel(policy.handling.min, policy.handling.max)} + ${dayRangeLabel(policy.transit.min, policy.transit.max)}`;
    const copy = SHIPPING_COPY[locale];
    shipping =
      policy.shippingRate === "0.00"
        ? copy.free(days)
        : copy.paid(formatStorefrontMoney(locale, policy.shippingRate, currency), days);
  }

  const returns =
    policy.returnDays !== null && policy.returnFees === "free"
      ? RETURNS_COPY[locale](policy.returnDays)
      : null;

  return { shipping, returns };
}

/** Single paragraph for cart drawer / compact notes (shipping · returns). */
export function formatMarketPolicyTrustNote(
  locale: AppLocale,
  policy: MarketPolicy | null,
  currency: string,
): string | null {
  const { shipping, returns } = formatMarketPolicyTrust(locale, policy, currency);
  const parts = [shipping, returns].filter((part): part is string => Boolean(part));
  return parts.length > 0 ? parts.join(" · ") : null;
}
