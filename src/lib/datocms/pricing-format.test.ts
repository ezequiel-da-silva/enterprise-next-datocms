import { describe, expect, it } from "vitest";
import {
  formatBillingPeriod,
  formatPriceLabel,
  parseAmount,
  parseBillingPeriod,
  parseCurrency,
  parsePriceType,
  parsePricingFeatures,
  popularBadgeLabel,
} from "./pricing-format";

describe("parsePriceType", () => {
  it("maps camelCase, snake_case, hyphen and labels", () => {
    expect(parsePriceType("paid")).toBe("paid");
    expect(parsePriceType("free")).toBe("free");
    expect(parsePriceType("upon-request")).toBe("upon-request");
    expect(parsePriceType("upon_request")).toBe("upon-request");
    expect(parsePriceType("Sob consulta")).toBe("upon-request");
    expect(parsePriceType("custom")).toBe("custom");
    expect(parsePriceType("Personalizado")).toBe("custom");
    expect(parsePriceType("Grátis")).toBe("free");
  });
});

describe("parseCurrency", () => {
  it("maps ISO-like tokens", () => {
    expect(parseCurrency("brl")).toBe("brl");
    expect(parseCurrency("USD")).toBe("usd");
    expect(parseCurrency("eur")).toBe("eur");
  });
});

describe("parseBillingPeriod", () => {
  it("maps periods including per-user", () => {
    expect(parseBillingPeriod("monthly")).toBe("monthly");
    expect(parseBillingPeriod("yearly")).toBe("yearly");
    expect(parseBillingPeriod("per_user_monthly")).toBe("per_user_monthly");
    expect(parseBillingPeriod("per-user-yearly")).toBe("per_user_yearly");
    expect(parseBillingPeriod("one_time")).toBe("one_time");
    expect(parseBillingPeriod(null)).toBeNull();
  });
});

describe("formatPriceLabel", () => {
  it("uses Portuguese copy for non-paid types", () => {
    expect(formatPriceLabel("free", 0, "brl", "pt")).toBe("Grátis");
    expect(formatPriceLabel("upon-request", null, "brl", "pt")).toBe("Sob consulta");
    expect(formatPriceLabel("custom", null, "usd", "pt")).toBe("Personalizado");
  });

  it("formats paid amounts with Intl", () => {
    const brl = formatPriceLabel("paid", 99, "brl", "pt");
    expect(brl).toMatch(/R\$/);
    expect(brl).toMatch(/99/);
    expect(formatPriceLabel("paid", 10, "usd", "en")).toMatch(/\$10/);
    expect(formatPriceLabel("paid", null, "eur", "en")).toBe("Upon request");
  });
});

describe("formatBillingPeriod", () => {
  it("maps the documented suffixes", () => {
    expect(formatBillingPeriod("monthly", "pt")).toBe("/mês");
    expect(formatBillingPeriod("yearly", "pt")).toBe("/ano");
    expect(formatBillingPeriod("per_user_monthly", "pt")).toBe("/user/mo.");
    expect(formatBillingPeriod("per_user_yearly", "en")).toBe("/user/yr.");
    expect(formatBillingPeriod("one_time", "pt")).toBe("cobrança única");
  });
});

describe("parseAmount", () => {
  it("accepts finite numbers and numeric strings", () => {
    expect(parseAmount(12.5)).toBe(12.5);
    expect(parseAmount("10,5")).toBe(10.5);
    expect(parseAmount("x")).toBeNull();
    expect(parseAmount(Number.NaN)).toBeNull();
  });
});

describe("parsePricingFeatures", () => {
  it("splits markdown lists and paragraphs", () => {
    expect(parsePricingFeatures("- One\n* Two\n1. Three\n\nFour")).toEqual(["One", "Two", "Three", "Four"]);
    expect(parsePricingFeatures("  ")).toEqual([]);
  });
});

describe("popularBadgeLabel", () => {
  it("localizes the badge", () => {
    expect(popularBadgeLabel("pt")).toBe("Mais popular");
    expect(popularBadgeLabel("en")).toBe("Most popular");
  });
});
