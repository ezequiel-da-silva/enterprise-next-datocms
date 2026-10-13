/**
 * Merchant listing policies for the Product JSON-LD (`Offer.shippingDetails`,
 * `Offer.hasMerchantReturnPolicy`). Values come from server-only env and must match the
 * Shopify checkout and policy pages; a missing or invalid value omits the block instead
 * of publishing data Google would flag as inconsistent.
 *
 *   SEO_SHIPPING_RATES=BR:0,US:9.90,ES:5   (amount in that market's offer currency)
 *   SEO_SHIPPING_HANDLING_DAYS=1-3
 *   SEO_SHIPPING_TRANSIT_DAYS=3-10
 *   SEO_RETURN_DAYS=30
 *   SEO_RETURN_FEES=free | customer
 */

type Env = Record<string, string | undefined>;

type DayRange = { min: number; max: number };

function readDayRange(raw: string | undefined): DayRange | null {
  const match = raw?.trim().match(/^(\d{1,3})(?:-(\d{1,3}))?$/);
  if (!match) return null;
  const min = Number(match[1]);
  const max = match[2] === undefined ? min : Number(match[2]);
  return max >= min ? { min, max } : null;
}

function readShippingRate(raw: string | undefined, country: string): string | null {
  for (const entry of (raw ?? "").split(",")) {
    const [code, amount] = entry.split(":").map((part) => part.trim());
    if (code?.toUpperCase() !== country.toUpperCase()) continue;
    return amount && /^\d+(\.\d{1,2})?$/.test(amount) ? amount : null;
  }
  return null;
}

function quantitativeDays({ min, max }: DayRange): Record<string, unknown> {
  return { "@type": "QuantitativeValue", minValue: min, maxValue: max, unitCode: "DAY" };
}

/** `OfferShippingDetails` for one market; `null` when that country has no valid rate or day ranges. */
export function shippingDetailsFor(
  country: string,
  currency: string,
  env: Env = process.env,
): Record<string, unknown> | null {
  const rate = readShippingRate(env.SEO_SHIPPING_RATES, country);
  const handling = readDayRange(env.SEO_SHIPPING_HANDLING_DAYS);
  const transit = readDayRange(env.SEO_SHIPPING_TRANSIT_DAYS);
  if (rate === null || !handling || !transit) return null;
  return {
    "@type": "OfferShippingDetails",
    shippingRate: { "@type": "MonetaryAmount", value: rate, currency },
    shippingDestination: { "@type": "DefinedRegion", addressCountry: country },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: quantitativeDays(handling),
      transitTime: quantitativeDays(transit),
    },
  };
}

const RETURN_FEES: Record<string, string> = {
  free: "https://schema.org/FreeReturn",
  customer: "https://schema.org/ReturnFeesCustomerResponsibility",
};

/** `MerchantReturnPolicy` with a finite window; `null` without valid `SEO_RETURN_DAYS` / `SEO_RETURN_FEES`. */
export function returnPolicyFor(country: string, env: Env = process.env): Record<string, unknown> | null {
  const daysRaw = env.SEO_RETURN_DAYS?.trim() ?? "";
  if (!/^\d{1,3}$/.test(daysRaw) || Number(daysRaw) < 1) return null;
  const fees = RETURN_FEES[env.SEO_RETURN_FEES?.trim().toLowerCase() ?? ""];
  if (!fees) return null;
  return {
    "@type": "MerchantReturnPolicy",
    applicableCountry: country,
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: Number(daysRaw),
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: fees,
  };
}
