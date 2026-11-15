import type { AppLocale } from "@/constants/i18n";
import type { MarketPolicy } from "@/lib/seo/merchant-policy";
import { currencyForShopifyCountry } from "@/lib/seo/format-market-policy-trust";
import { formatStorefrontMoney } from "@/lib/shopify/format-money";
import type { ShopifyCountryCode } from "@/lib/shopify/locale-map";

/** Markets shown on the shipping & returns page (same set as `market_policy` records). */
export const MARKET_POLICY_TABLE_COUNTRIES: readonly ShopifyCountryCode[] = ["US", "BR", "ES"];

/** Slugs of the CMS "Shipping & returns" page per locale (`setup-shipping-returns-faq-page.ts`). */
const SHIPPING_RETURNS_SLUGS: Record<AppLocale, string> = {
  en: "shipping-returns",
  pt: "envios-e-devolucoes",
  es: "envios-y-devoluciones",
};

export function isShippingReturnsPageSlug(locale: AppLocale, slug: string): boolean {
  return SHIPPING_RETURNS_SLUGS[locale] === slug.trim().toLowerCase();
}

export type MarketPolicyTableCopy = {
  caption: string;
  market: string;
  shipping: string;
  handling: string;
  transit: string;
  returns: string;
  freeShipping: string;
  returnsFree: (days: number) => string;
  returnsCustomer: (days: number) => string;
  returnsDaysOnly: (days: number) => string;
  /** Unit after a day range, e.g. `business days`. */
  businessDays: string;
  /** Shown when the CMS has no (valid) value for a cell — never a guess. */
  empty: string;
};

export const MARKET_POLICY_TABLE_COPY: Record<AppLocale, MarketPolicyTableCopy> = {
  en: {
    caption: "Shipping and returns by market",
    market: "Market",
    shipping: "Shipping",
    handling: "Order preparation",
    transit: "Delivery",
    returns: "Returns",
    freeShipping: "Free",
    returnsFree: (days) => `Free returns within ${days} days`,
    returnsCustomer: (days) => `Returns within ${days} days (return shipping paid by customer)`,
    returnsDaysOnly: (days) => `Returns within ${days} days`,
    businessDays: "business days",
    empty: "—",
  },
  pt: {
    caption: "Envio e devoluções por mercado",
    market: "Mercado",
    shipping: "Frete",
    handling: "Preparação do pedido",
    transit: "Entrega",
    returns: "Devoluções",
    freeShipping: "Grátis",
    returnsFree: (days) => `Devolução grátis em até ${days} dias`,
    returnsCustomer: (days) => `Devolução em até ${days} dias (frete de devolução por conta do cliente)`,
    returnsDaysOnly: (days) => `Devolução em até ${days} dias`,
    businessDays: "dias úteis",
    empty: "—",
  },
  es: {
    caption: "Envíos y devoluciones por mercado",
    market: "Mercado",
    shipping: "Envío",
    handling: "Preparación del pedido",
    transit: "Entrega",
    returns: "Devoluciones",
    freeShipping: "Gratis",
    returnsFree: (days) => `Devoluciones gratis en ${days} días`,
    returnsCustomer: (days) => `Devoluciones en ${days} días (envío de devolución a cargo del cliente)`,
    returnsDaysOnly: (days) => `Devoluciones en ${days} días`,
    businessDays: "días laborables",
    empty: "—",
  },
};

export type MarketPolicyTableRow = {
  country: ShopifyCountryCode;
  marketLabel: string;
  shipping: string;
  handling: string;
  transit: string;
  returns: string;
};

function dayRangeText(range: { min: number; max: number } | null, unit: string, empty: string): string {
  if (!range) return empty;
  const days = range.min === range.max ? String(range.min) : `${range.min}–${range.max}`;
  return `${days} ${unit}`;
}

function regionName(locale: AppLocale, country: string): string {
  const tag = locale === "pt" ? "pt-BR" : locale;
  try {
    return new Intl.DisplayNames(tag, { type: "region" }).of(country) ?? country;
  } catch {
    return country;
  }
}

/**
 * One row per market that has a validated `market_policy`. Cells without CMS data stay empty
 * (`—`); no rates, windows or fees are ever invented. Markets with no data at all are dropped.
 */
export function buildMarketPolicyTableRows(
  locale: AppLocale,
  entries: readonly { country: ShopifyCountryCode; policy: MarketPolicy | null }[],
): MarketPolicyTableRow[] {
  const copy = MARKET_POLICY_TABLE_COPY[locale];
  return entries.flatMap(({ country, policy }) => {
    if (!policy) return [];
    const hasData =
      policy.shippingRate !== null ||
      policy.handling !== null ||
      policy.transit !== null ||
      policy.returnDays !== null;
    if (!hasData) return [];

    const currency = currencyForShopifyCountry(country);
    const shipping =
      policy.shippingRate === null
        ? copy.empty
        : policy.shippingRate === "0.00"
          ? copy.freeShipping
          : formatStorefrontMoney(locale, policy.shippingRate, currency);

    let returns = copy.empty;
    if (policy.returnDays !== null) {
      returns =
        policy.returnFees === "free"
          ? copy.returnsFree(policy.returnDays)
          : policy.returnFees === "customer"
            ? copy.returnsCustomer(policy.returnDays)
            : copy.returnsDaysOnly(policy.returnDays);
    }

    return [
      {
        country,
        marketLabel: regionName(locale, country),
        shipping,
        handling: dayRangeText(policy.handling, copy.businessDays, copy.empty),
        transit: dayRangeText(policy.transit, copy.businessDays, copy.empty),
        returns,
      },
    ];
  });
}
