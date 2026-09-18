import { describe, expect, it } from "vitest";
import { pickShopifyLocale, shopifyCountryFromLocale, translationValue } from "@/lib/shopify/locale-map";

describe("pickShopifyLocale", () => {
  it("prefers pt-BR when the shop publishes it", () => {
    expect(pickShopifyLocale(["en", "pt-BR", "es"], ["pt", "pt-BR"])).toBe("pt-BR");
  });

  it("falls back to pt for Market BR language PT", () => {
    expect(pickShopifyLocale(["en", "pt", "es"], ["pt", "pt-BR"])).toBe("pt");
  });

  it("uses the first candidate when shop locales are unknown", () => {
    expect(pickShopifyLocale([], ["pt", "pt-BR"])).toBe("pt");
  });
});

describe("shopifyCountryFromLocale", () => {
  it("maps site locales to Shopify Markets countries", () => {
    expect(shopifyCountryFromLocale("en")).toBe("US");
    expect(shopifyCountryFromLocale("pt")).toBe("BR");
    expect(shopifyCountryFromLocale("es")).toBe("ES");
  });
});

describe("translationValue", () => {
  it("reads the title translation", () => {
    expect(translationValue([{ key: "body_html", value: "x" }, { key: "title", value: "  Chapéu  " }])).toBe(
      "Chapéu",
    );
  });
});
