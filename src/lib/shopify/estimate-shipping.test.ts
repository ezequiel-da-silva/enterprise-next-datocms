import { describe, expect, it } from "vitest";
import type { MarketPolicy } from "@/lib/seo/merchant-policy";
import {
  estimateShippingFromMarketPolicy,
  normalizeBrCep,
} from "@/lib/shopify/estimate-shipping";

const POLICY: MarketPolicy = {
  shippingRate: "19.90",
  freeShippingThreshold: 300,
  handling: { min: 1, max: 2 },
  transit: { min: 3, max: 7 },
  returnDays: 30,
  returnFees: "free",
  installmentCount: 10,
  installmentMultiplier: 1,
  pixDiscountPercent: null,
};

describe("normalizeBrCep", () => {
  it("accepts formatted and plain CEPs", () => {
    expect(normalizeBrCep("01310-100")).toBe("01310100");
    expect(normalizeBrCep("01310100")).toBe("01310100");
  });

  it("rejects short or non-digit values", () => {
    expect(normalizeBrCep("1310")).toBeNull();
    expect(normalizeBrCep("abcdefgh")).toBeNull();
  });
});

describe("estimateShippingFromMarketPolicy", () => {
  it("returns a paid estimate with ETA", () => {
    const result = estimateShippingFromMarketPolicy("pt", POLICY, "BRL", 50);
    expect(result?.free).toBe(false);
    expect(result?.rateLabel).toMatch(/19/);
    expect(result?.etaLabel).toMatch(/dias úteis/);
    expect(result?.disclaimer).toMatch(/checkout/);
  });

  it("marks free when subtotal reaches the threshold", () => {
    expect(estimateShippingFromMarketPolicy("pt", POLICY, "BRL", 300)?.free).toBe(true);
  });

  it("returns null without a shipping rate", () => {
    expect(
      estimateShippingFromMarketPolicy("pt", { ...POLICY, shippingRate: null }, "BRL"),
    ).toBeNull();
  });
});
