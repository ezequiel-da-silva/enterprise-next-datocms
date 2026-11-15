import { describe, expect, it } from "vitest";
import {
  discountPercent,
  formatDiscountPill,
  hasCompareAtDeal,
  parseMoneyAmount,
  resolveCompareAtDeal,
} from "@/lib/shopify/compare-at-price";

describe("parseMoneyAmount", () => {
  it("parses finite amounts", () => {
    expect(parseMoneyAmount("600.00")).toBe(600);
    expect(parseMoneyAmount(" 9.95 ")).toBe(9.95);
  });

  it("returns null for empty or invalid", () => {
    expect(parseMoneyAmount(null)).toBeNull();
    expect(parseMoneyAmount("")).toBeNull();
    expect(parseMoneyAmount("abc")).toBeNull();
  });
});

describe("discountPercent", () => {
  it("returns null when compare-at is missing or not higher", () => {
    expect(discountPercent("100", null)).toBeNull();
    expect(discountPercent("100", "100")).toBeNull();
    expect(discountPercent("100", "80")).toBeNull();
  });

  it("rounds to an integer percent in 1–99", () => {
    expect(discountPercent("80", "100")).toBe(20);
    expect(discountPercent("600", "750")).toBe(20);
    expect(discountPercent("99", "100")).toBe(1);
  });
});

describe("hasCompareAtDeal / formatDiscountPill", () => {
  it("mirrors discountPercent and formats the pill", () => {
    expect(hasCompareAtDeal("80", "100")).toBe(true);
    expect(hasCompareAtDeal("100", "100")).toBe(false);
    expect(formatDiscountPill(20)).toBe("-20%");
  });
});

describe("resolveCompareAtDeal", () => {
  const price = { amount: "600.00", currencyCode: "BRL" };

  it("returns a localized label and percent for a real deal", () => {
    const deal = resolveCompareAtDeal("pt", price, { amount: "750.00", currencyCode: "BRL" });
    expect(deal?.discountPercent).toBe(20);
    expect(deal?.compareAtPriceLabel).toMatch(/750/);
  });

  it("returns null without compare-at, equal compare-at, or mismatched currency", () => {
    expect(resolveCompareAtDeal("pt", price, null)).toBeNull();
    expect(resolveCompareAtDeal("pt", price, { amount: "600.00", currencyCode: "BRL" })).toBeNull();
    expect(resolveCompareAtDeal("pt", price, { amount: "900.00", currencyCode: "USD" })).toBeNull();
  });
});
