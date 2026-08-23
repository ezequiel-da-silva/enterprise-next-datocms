/**
 * Campos do bloco DatoCMS `pricing_card` (nested em `pricing_section.plans`).
 * API keys snake_case; CDA expõe camelCase. Selects podem vir como label.
 *
 * | Campo           | API key          | Valores |
 * |-----------------|------------------|---------|
 * | Price type      | price_type       | paid \| free \| upon-request \| custom |
 * | Currency        | currency         | brl \| usd \| eur |
 * | Billing period  | billing_period   | monthly \| yearly \| per_user_monthly \| per_user_yearly \| one_time |
 */

import type { AppLocale } from "@/constants/i18n";

export type PricingPriceType = "paid" | "free" | "upon-request" | "custom";
export type PricingCurrency = "brl" | "usd" | "eur";
export type PricingBillingPeriod =
  | "monthly"
  | "yearly"
  | "per_user_monthly"
  | "per_user_yearly"
  | "one_time";

const PRICE_TYPE_LABEL: Record<AppLocale, Record<Exclude<PricingPriceType, "paid">, string>> = {
  pt: { free: "Grátis", "upon-request": "Sob consulta", custom: "Personalizado" },
  en: { free: "Free", "upon-request": "Upon request", custom: "Custom" },
  es: { free: "Gratis", "upon-request": "Bajo consulta", custom: "Personalizado" },
};

const BILLING_PERIOD_LABEL: Record<AppLocale, Record<PricingBillingPeriod, string>> = {
  pt: {
    monthly: "/mês",
    yearly: "/ano",
    per_user_monthly: "/user/mo.",
    per_user_yearly: "/user/yr.",
    one_time: "cobrança única",
  },
  en: {
    monthly: "/mo",
    yearly: "/yr",
    per_user_monthly: "/user/mo.",
    per_user_yearly: "/user/yr.",
    one_time: "one-time",
  },
  es: {
    monthly: "/mes",
    yearly: "/año",
    per_user_monthly: "/user/mo.",
    per_user_yearly: "/user/yr.",
    one_time: "pago único",
  },
};

const CURRENCY_CODE: Record<PricingCurrency, string> = {
  brl: "BRL",
  usd: "USD",
  eur: "EUR",
};

const NUMBER_LOCALE: Record<AppLocale, string> = {
  en: "en-US",
  pt: "pt-BR",
  es: "es-ES",
};

function normalizeToken(raw: string): string {
  return raw.trim().toLowerCase().replace(/[\s]+/g, "_").replace(/-/g, "-");
}

export function parsePriceType(raw: string | null | undefined): PricingPriceType {
  if (!raw?.trim()) return "paid";
  const v = normalizeToken(raw).replace(/-/g, "_");
  if (v === "free" || v.includes("gratis") || v.includes("grátis") || v === "free_plan") return "free";
  if (v === "upon_request" || v.includes("consulta") || v.includes("request") || v.includes("quote")) {
    return "upon-request";
  }
  if (v === "custom" || v.includes("personal")) return "custom";
  if (v === "paid" || v.includes("pago") || v.includes("paid")) return "paid";
  return "paid";
}

export function parseCurrency(raw: string | null | undefined): PricingCurrency {
  if (!raw?.trim()) return "brl";
  const v = normalizeToken(raw);
  if (v === "usd" || v.includes("dollar") || v === "$") return "usd";
  if (v === "eur" || v.includes("euro") || v === "€") return "eur";
  return "brl";
}

export function parseBillingPeriod(raw: string | null | undefined): PricingBillingPeriod | null {
  if (!raw?.trim()) return null;
  const v = normalizeToken(raw).replace(/-/g, "_");
  if (v === "per_user_monthly" || (v.includes("user") && v.includes("month"))) return "per_user_monthly";
  if (v === "per_user_yearly" || (v.includes("user") && (v.includes("year") || v.includes("anual")))) {
    return "per_user_yearly";
  }
  if (v === "one_time" || v.includes("unica") || v.includes("única") || v.includes("one_time") || v.includes("onetime")) {
    return "one_time";
  }
  if (v === "yearly" || v.includes("ano") || v.includes("year") || v.includes("anual")) return "yearly";
  if (v === "monthly" || v.includes("mes") || v.includes("mês") || v.includes("month")) return "monthly";
  return null;
}

export function parseAmount(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string" && raw.trim() !== "") {
    const n = Number(raw.replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function formatPriceAmount(
  amount: number,
  currency: PricingCurrency,
  locale: AppLocale,
): string {
  return new Intl.NumberFormat(NUMBER_LOCALE[locale], {
    style: "currency",
    currency: CURRENCY_CODE[currency],
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function formatPriceLabel(
  priceType: PricingPriceType,
  amount: number | null,
  currency: PricingCurrency,
  locale: AppLocale,
): string {
  if (priceType === "paid") {
    if (amount == null) return PRICE_TYPE_LABEL[locale]["upon-request"];
    return formatPriceAmount(amount, currency, locale);
  }
  return PRICE_TYPE_LABEL[locale][priceType];
}

export function formatBillingPeriod(period: PricingBillingPeriod | null, locale: AppLocale): string | null {
  if (!period) return null;
  return BILLING_PERIOD_LABEL[locale][period];
}

const FEATURE_PREFIX = /^(?:[-*•]\s+|\d+[.)]\s+)/;

/** Parte markdown / parágrafos em itens de lista. */
export function parsePricingFeatures(text: string | null | undefined): string[] {
  if (!text?.trim()) return [];
  return text
    .split(/\r?\n/)
    .map((line) => line.trim().replace(FEATURE_PREFIX, "").trim())
    .filter((line) => line.length > 0 && line !== "---");
}

export function popularBadgeLabel(locale: AppLocale): string {
  if (locale === "pt") return "Mais popular";
  if (locale === "es") return "Más popular";
  return "Most popular";
}
