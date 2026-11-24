import type { AppLocale } from "@/constants/i18n";
import type { ChromeCopy } from "@/lib/i18n/chrome-copy";
import { resolveAnnouncementFreeShipping } from "@/lib/i18n/chrome-copy";
import type { MarketPolicy } from "@/lib/seo/merchant-policy";
import { formatStorefrontMoney } from "@/lib/shopify/format-money";

function withPtCdcCue(locale: AppLocale, line: string, copy: ChromeCopy): string {
  if (locale !== "pt") return line;
  const cue = copy.announcementCdcCoolingOff.trim();
  return cue ? `${line} · ${cue}` : line;
}

/**
 * Compact top-of-page trust line from `market_policy` + chrome copy.
 * Prefer free-shipping threshold; else flat free rate / returns; `null` hides the strip.
 * PT appends a short Art. 49 cue after free-shipping lines (details live on refund-policy).
 */
export function formatAnnouncementStrip(
  locale: AppLocale,
  policy: MarketPolicy | null,
  currency: string,
  copy: ChromeCopy,
): string | null {
  if (!policy) return null;

  if (policy.freeShippingThreshold !== null && policy.freeShippingThreshold > 0) {
    const amount = formatStorefrontMoney(locale, policy.freeShippingThreshold.toFixed(2), currency);
    return withPtCdcCue(
      locale,
      resolveAnnouncementFreeShipping(copy.announcementFreeShippingTemplate, amount),
      copy,
    );
  }

  if (policy.shippingRate === "0.00") {
    return withPtCdcCue(locale, copy.announcementFreeShippingFlat, copy);
  }

  if (policy.returnDays !== null && policy.returnFees === "free") {
    return copy.announcementReturns.replace(/\d+/, String(policy.returnDays));
  }

  return null;
}

/** Short footer market line (country · currency · optional free-ship cue). */
export function formatFooterMarketSummary(
  locale: AppLocale,
  country: string,
  currency: string,
  policy: MarketPolicy | null,
  copy: ChromeCopy,
): string | null {
  const code = country.trim().toUpperCase();
  if (!code) return null;
  const parts = [`${code} · ${currency}`];
  if (policy?.freeShippingThreshold && policy.freeShippingThreshold > 0) {
    parts.push(
      resolveAnnouncementFreeShipping(
        copy.announcementFreeShippingTemplate,
        formatStorefrontMoney(locale, policy.freeShippingThreshold.toFixed(2), currency),
      ),
    );
  } else if (policy?.shippingRate === "0.00") {
    parts.push(
      locale === "pt" ? "Frete grátis" : locale === "es" ? "Envío gratis" : "Free shipping",
    );
  }
  return parts.join(" · ");
}
