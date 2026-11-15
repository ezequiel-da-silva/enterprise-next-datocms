/**
 * Sale / compare-at helpers for Storefront money amounts.
 * Returns null when there is no meaningful discount to show.
 */

import type { AppLocale } from "@/constants/i18n";
import type { StorefrontMoney } from "@/infra/shopify/storefront";
import { formatStorefrontMoney } from "@/lib/shopify/format-money";

export function parseMoneyAmount(raw: string | null | undefined): number | null {
  if (raw == null || !String(raw).trim()) return null;
  const n = Number.parseFloat(String(raw).trim());
  return Number.isFinite(n) ? n : null;
}

/** True when compare-at is strictly greater than the current price. */
export function hasCompareAtDeal(
  priceAmount: string | null | undefined,
  compareAtAmount: string | null | undefined,
): boolean {
  return discountPercent(priceAmount, compareAtAmount) != null;
}

/**
 * Integer percent off (1–99), or null if compare-at is missing / not higher than price.
 */
export function discountPercent(
  priceAmount: string | null | undefined,
  compareAtAmount: string | null | undefined,
): number | null {
  const price = parseMoneyAmount(priceAmount);
  const compareAt = parseMoneyAmount(compareAtAmount);
  if (price == null || compareAt == null || compareAt <= price || compareAt <= 0) return null;
  const pct = Math.round(((compareAt - price) / compareAt) * 100);
  if (pct < 1 || pct > 99) return null;
  return pct;
}

export function formatDiscountPill(percent: number): string {
  return `-${percent}%`;
}

export type CompareAtDeal = {
  compareAtPriceLabel: string;
  discountPercent: number;
};

/** Localized strike-through price + percent for UI; `null` when there is no real deal. */
export function resolveCompareAtDeal(
  locale: AppLocale,
  price: StorefrontMoney,
  compareAt: StorefrontMoney | null | undefined,
): CompareAtDeal | null {
  if (!compareAt || compareAt.currencyCode !== price.currencyCode) return null;
  const percent = discountPercent(price.amount, compareAt.amount);
  if (percent == null) return null;
  return {
    compareAtPriceLabel: formatStorefrontMoney(locale, compareAt.amount, compareAt.currencyCode),
    discountPercent: percent,
  };
}
