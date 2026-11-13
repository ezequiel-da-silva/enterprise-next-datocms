import { describe, expect, it } from "vitest";
import {
  currencyForShopifyCountry,
  formatMarketPolicyTrust,
  formatMarketPolicyTrustNote,
} from "@/lib/seo/format-market-policy-trust";
import { normalizeMarketPolicy } from "@/lib/seo/merchant-policy";

const US = normalizeMarketPolicy({
  shippingRate: 9.9,
  handlingDaysMin: 1,
  handlingDaysMax: 2,
  transitDaysMin: 3,
  transitDaysMax: 7,
  returnDays: 30,
  returnFees: "free",
});

const BR = normalizeMarketPolicy({
  shippingRate: 0,
  handlingDaysMin: 1,
  handlingDaysMax: 2,
  transitDaysMin: 3,
  transitDaysMax: 7,
  returnDays: 30,
  returnFees: "free",
});

describe("currencyForShopifyCountry", () => {
  it("maps Markets to offer currencies", () => {
    expect(currencyForShopifyCountry("US")).toBe("USD");
    expect(currencyForShopifyCountry("BR")).toBe("BRL");
    expect(currencyForShopifyCountry("ES")).toBe("EUR");
  });
});

describe("formatMarketPolicyTrust", () => {
  it("returns null lines without a policy", () => {
    expect(formatMarketPolicyTrust("en", null, "USD")).toEqual({ shipping: null, returns: null });
  });

  it("formats paid US shipping and free returns", () => {
    const lines = formatMarketPolicyTrust("en", US, "USD");
    expect(lines.shipping).toMatch(/Shipping from/);
    expect(lines.shipping).toMatch(/1–2 \+ 3–7/);
    expect(lines.returns).toBe("Free returns within 30 days");
  });

  it("formats free BR shipping in Portuguese", () => {
    const lines = formatMarketPolicyTrust("pt", BR, "BRL");
    expect(lines.shipping).toMatch(/^Frete grátis/);
    expect(lines.returns).toBe("Devolução grátis em até 30 dias");
  });

  it("omits shipping when rate or day ranges are missing", () => {
    const incomplete = normalizeMarketPolicy({
      shippingRate: 5,
      handlingDaysMin: 1,
      handlingDaysMax: 2,
      returnDays: 30,
      returnFees: "free",
    });
    expect(formatMarketPolicyTrust("en", incomplete, "USD").shipping).toBeNull();
    expect(formatMarketPolicyTrust("en", incomplete, "USD").returns).toBe("Free returns within 30 days");
  });

  it("omits returns when fees are not free", () => {
    const customer = normalizeMarketPolicy({
      shippingRate: 0,
      handlingDaysMin: 1,
      handlingDaysMax: 1,
      transitDaysMin: 2,
      transitDaysMax: 2,
      returnDays: 30,
      returnFees: "customer",
    });
    expect(formatMarketPolicyTrust("en", customer, "USD").returns).toBeNull();
  });
});

describe("formatMarketPolicyTrustNote", () => {
  it("joins shipping and returns", () => {
    const note = formatMarketPolicyTrustNote("es", US, "EUR");
    expect(note).toContain("Envío desde");
    expect(note).toContain("Devoluciones gratis en 30 días");
    expect(note).toContain(" · ");
  });

  it("returns null when nothing to show", () => {
    expect(formatMarketPolicyTrustNote("en", null, "USD")).toBeNull();
  });
});
