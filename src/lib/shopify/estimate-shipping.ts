import type { AppLocale } from "@/constants/i18n";
import type { MarketPolicy } from "@/lib/seo/merchant-policy";
import { formatStorefrontMoney } from "@/lib/shopify/format-money";

export type ShippingEstimate = {
  free: boolean;
  rateLabel: string | null;
  etaLabel: string | null;
  disclaimer: string;
};

function dayRangeLabel(min: number, max: number): string {
  return min === max ? String(min) : `${min}–${max}`;
}

const ETA: Record<AppLocale, (days: string) => string> = {
  en: (days) => `${days} business days`,
  pt: (days) => `${days} dias úteis`,
  es: (days) => `${days} días laborables`,
};

const FREE: Record<AppLocale, string> = {
  en: "Free shipping",
  pt: "Frete grátis",
  es: "Envío gratis",
};

const DISCLAIMER: Record<AppLocale, string> = {
  en: "Approximate estimate — final shipping is calculated at Shopify checkout.",
  pt: "Estimativa aproximada — o frete final é calculado no checkout Shopify.",
  es: "Estimación aproximada — el envío final se calcula en el checkout de Shopify.",
};

/** Digits-only BR CEP (8). */
export function normalizeBrCep(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  return /^\d{8}$/.test(digits) ? digits : null;
}

/**
 * Static / approximate shipping estimate from `market_policy`.
 * CEP is validated by the caller for UX; it does not change the rate in v1.
 */
export function estimateShippingFromMarketPolicy(
  locale: AppLocale,
  policy: MarketPolicy | null,
  currency: string,
  subtotal?: number | null,
): ShippingEstimate | null {
  if (!policy || policy.shippingRate === null) return null;

  const threshold = policy.freeShippingThreshold;
  const freeByRate = policy.shippingRate === "0.00";
  const freeByThreshold =
    threshold != null &&
    subtotal != null &&
    Number.isFinite(subtotal) &&
    subtotal >= threshold;
  const free = freeByRate || freeByThreshold;

  let etaLabel: string | null = null;
  if (policy.handling && policy.transit) {
    const days = `${dayRangeLabel(policy.handling.min, policy.handling.max)} + ${dayRangeLabel(policy.transit.min, policy.transit.max)}`;
    etaLabel = ETA[locale](days);
  }

  return {
    free,
    rateLabel: free
      ? FREE[locale]
      : formatStorefrontMoney(locale, policy.shippingRate, currency),
    etaLabel,
    disclaimer: DISCLAIMER[locale],
  };
}
