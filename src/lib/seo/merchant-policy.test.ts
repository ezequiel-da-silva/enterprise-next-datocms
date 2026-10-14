import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  MARKET_POLICY_FIELDS,
  normalizeMarketPolicy,
  returnPolicyFor,
  shippingDetailsFor,
  type MarketPolicyRecord,
} from "@/lib/seo/merchant-policy";

const FULL: MarketPolicyRecord = {
  country: "US",
  shippingRate: 9.9,
  handlingDaysMin: 1,
  handlingDaysMax: 3,
  transitDaysMin: 3,
  transitDaysMax: 10,
  returnDays: 30,
  returnFees: "free",
};

const policy = (overrides: MarketPolicyRecord = {}) => normalizeMarketPolicy({ ...FULL, ...overrides });

function camelToSnake(name: string): string {
  return name.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

describe("market_policy field map", () => {
  it("matches the api keys created by the Dato migration", () => {
    const migration = readFileSync(join(process.cwd(), "migrations", "1790800000_marketPolicy.ts"), "utf8");
    for (const field of MARKET_POLICY_FIELDS) {
      expect(migration).toContain(`"${camelToSnake(field)}"`);
    }
  });
});

describe("normalizeMarketPolicy", () => {
  it("returns null without a record", () => {
    expect(normalizeMarketPolicy(null)).toBeNull();
    expect(normalizeMarketPolicy(undefined)).toBeNull();
  });

  it("normalizes a complete record", () => {
    expect(policy()).toEqual({
      shippingRate: "9.90",
      handling: { min: 1, max: 3 },
      transit: { min: 3, max: 10 },
      returnDays: 30,
      returnFees: "free",
    });
  });

  it("treats an empty max as a fixed number of days", () => {
    expect(policy({ handlingDaysMax: null })?.handling).toEqual({ min: 1, max: 1 });
  });

  it("drops inverted ranges, out-of-range numbers and unknown fees independently", () => {
    const result = policy({ transitDaysMin: 10, transitDaysMax: 3, returnDays: 0, returnFees: "maybe", shippingRate: -1 });
    expect(result).toMatchObject({ transit: null, returnDays: null, returnFees: null, shippingRate: null });
    expect(result?.handling).toEqual({ min: 1, max: 3 });
  });

  it("keeps free shipping (0) as a valid rate", () => {
    expect(policy({ shippingRate: 0 })?.shippingRate).toBe("0.00");
  });
});

describe("shippingDetailsFor", () => {
  it("builds OfferShippingDetails for the market's country and currency", () => {
    expect(shippingDetailsFor(policy(), "US", "USD")).toEqual({
      "@type": "OfferShippingDetails",
      shippingRate: { "@type": "MonetaryAmount", value: "9.90", currency: "USD" },
      shippingDestination: { "@type": "DefinedRegion", addressCountry: "US" },
      deliveryTime: {
        "@type": "ShippingDeliveryTime",
        handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "DAY" },
        transitTime: { "@type": "QuantitativeValue", minValue: 3, maxValue: 10, unitCode: "DAY" },
      },
    });
  });

  it("supports free shipping and a single-day range", () => {
    const details = shippingDetailsFor(policy({ shippingRate: 0, handlingDaysMin: 2, handlingDaysMax: null }), "BR", "BRL");
    expect(details?.shippingRate).toEqual({ "@type": "MonetaryAmount", value: "0.00", currency: "BRL" });
    expect((details?.deliveryTime as { handlingTime: unknown }).handlingTime).toMatchObject({ minValue: 2, maxValue: 2 });
  });

  it("omits the block without a policy or with an incomplete one", () => {
    expect(shippingDetailsFor(null, "BR", "BRL")).toBeNull();
    expect(shippingDetailsFor(policy({ shippingRate: null }), "BR", "BRL")).toBeNull();
    expect(shippingDetailsFor(policy({ transitDaysMin: 10, transitDaysMax: 3 }), "BR", "BRL")).toBeNull();
    expect(shippingDetailsFor(policy({ handlingDaysMin: null }), "BR", "BRL")).toBeNull();
  });
});

describe("returnPolicyFor", () => {
  it("builds a finite-window MerchantReturnPolicy", () => {
    expect(returnPolicyFor(policy(), "BR")).toEqual({
      "@type": "MerchantReturnPolicy",
      applicableCountry: "BR",
      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 30,
      returnMethod: "https://schema.org/ReturnByMail",
      returnFees: "https://schema.org/FreeReturn",
    });
    expect(returnPolicyFor(policy({ returnDays: 7, returnFees: "Customer" }), "US")?.returnFees).toBe(
      "https://schema.org/ReturnFeesCustomerResponsibility",
    );
  });

  it("omits the policy without a policy or with invalid values", () => {
    expect(returnPolicyFor(null, "BR")).toBeNull();
    expect(returnPolicyFor(policy({ returnFees: "maybe" }), "BR")).toBeNull();
    expect(returnPolicyFor(policy({ returnDays: 0 }), "BR")).toBeNull();
    expect(returnPolicyFor(policy({ returnDays: null }), "BR")).toBeNull();
  });
});
