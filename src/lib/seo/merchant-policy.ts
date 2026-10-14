/**
 * Merchant listing policies for the Product JSON-LD (`Offer.shippingDetails`,
 * `Offer.hasMerchantReturnPolicy`). Values come from the Dato `market_policy` model (one record
 * per country) and must match the Shopify checkout and policy pages; a missing or invalid value
 * omits the block instead of publishing data Google would flag as inconsistent.
 *
 * Pure: `infra/datocms/get-market-policy.ts` fetches, `normalizeMarketPolicy` validates.
 */

/** CDA field names of `market_policy` (the Dato migration `marketPolicy` creates the snake_case keys). */
export const MARKET_POLICY_FIELDS = [
  "country",
  "shippingRate",
  "handlingDaysMin",
  "handlingDaysMax",
  "transitDaysMin",
  "transitDaysMax",
  "returnDays",
  "returnFees",
] as const;

export type MarketPolicyField = (typeof MARKET_POLICY_FIELDS)[number];

/** Raw `market_policy` record as returned by the CDA. */
export type MarketPolicyRecord = Partial<Record<MarketPolicyField, string | number | null>>;

export type DayRange = { min: number; max: number };

export type ReturnFees = "free" | "customer";

/** Validated policy for one market. Every part is independent and `null` when absent or invalid. */
export type MarketPolicy = {
  /** Fixed 2-decimal amount in the offer currency, e.g. `"9.90"`; `"0.00"` is free shipping. */
  shippingRate: string | null;
  handling: DayRange | null;
  transit: DayRange | null;
  returnDays: number | null;
  returnFees: ReturnFees | null;
};

function toNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toWholeDays(value: unknown, min: number, max: number): number | null {
  const parsed = toNumber(value);
  return parsed !== null && Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : null;
}

/** `max` empty means a fixed number of days; an inverted or invalid range is dropped. */
function dayRange(minRaw: unknown, maxRaw: unknown): DayRange | null {
  const min = toWholeDays(minRaw, 0, 60);
  if (min === null) return null;
  const hasMax = maxRaw !== null && maxRaw !== undefined && maxRaw !== "";
  const max = hasMax ? toWholeDays(maxRaw, 0, 60) : min;
  return max !== null && max >= min ? { min, max } : null;
}

/** Validates a raw CMS record; `null` when there is no record at all. */
export function normalizeMarketPolicy(record: MarketPolicyRecord | null | undefined): MarketPolicy | null {
  if (!record) return null;
  const rate = toNumber(record.shippingRate);
  const fees = typeof record.returnFees === "string" ? record.returnFees.trim().toLowerCase() : "";
  return {
    shippingRate: rate !== null && rate >= 0 && rate <= 10000 ? rate.toFixed(2) : null,
    handling: dayRange(record.handlingDaysMin, record.handlingDaysMax),
    transit: dayRange(record.transitDaysMin, record.transitDaysMax),
    returnDays: toWholeDays(record.returnDays, 1, 365),
    returnFees: fees === "free" || fees === "customer" ? fees : null,
  };
}

function quantitativeDays({ min, max }: DayRange): Record<string, unknown> {
  return { "@type": "QuantitativeValue", minValue: min, maxValue: max, unitCode: "DAY" };
}

/** `OfferShippingDetails` for one market; `null` without a valid rate and both day ranges. */
export function shippingDetailsFor(
  policy: MarketPolicy | null,
  country: string,
  currency: string,
): Record<string, unknown> | null {
  if (!policy || policy.shippingRate === null || !policy.handling || !policy.transit) return null;
  return {
    "@type": "OfferShippingDetails",
    shippingRate: { "@type": "MonetaryAmount", value: policy.shippingRate, currency },
    shippingDestination: { "@type": "DefinedRegion", addressCountry: country },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: quantitativeDays(policy.handling),
      transitTime: quantitativeDays(policy.transit),
    },
  };
}

const RETURN_FEES: Record<ReturnFees, string> = {
  free: "https://schema.org/FreeReturn",
  customer: "https://schema.org/ReturnFeesCustomerResponsibility",
};

/** `MerchantReturnPolicy` with a finite window; `null` without a valid window and fee rule. */
export function returnPolicyFor(policy: MarketPolicy | null, country: string): Record<string, unknown> | null {
  if (!policy || policy.returnDays === null || !policy.returnFees) return null;
  return {
    "@type": "MerchantReturnPolicy",
    applicableCountry: country,
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: policy.returnDays,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: RETURN_FEES[policy.returnFees],
  };
}
