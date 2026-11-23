import { describe, expect, it } from "vitest";
import {
  findVariantForOption,
  isOptionValueAvailable,
  resolveQuickAddOptionName,
  uniqueOptionValues,
  type QuickAddVariant,
} from "@/lib/shopify/quick-add-variants";

const variants: QuickAddVariant[] = [
  {
    id: "gid://shopify/ProductVariant/1",
    availableForSale: true,
    selectedOptions: [{ name: "Size", value: "152" }],
    price: { amount: "600.00", currencyCode: "USD" },
  },
  {
    id: "gid://shopify/ProductVariant/2",
    availableForSale: false,
    selectedOptions: [{ name: "Size", value: "156" }],
    price: { amount: "600.00", currencyCode: "USD" },
  },
  {
    id: "gid://shopify/ProductVariant/3",
    availableForSale: true,
    selectedOptions: [{ name: "Size", value: "158" }],
    price: { amount: "620.00", currencyCode: "USD" },
  },
];

describe("quick-add-variants", () => {
  it("resolves a Size option group", () => {
    expect(resolveQuickAddOptionName(variants)).toBe("Size");
  });

  it("lists unique size values in order of appearance", () => {
    expect(uniqueOptionValues(variants, "Size")).toEqual(["152", "156", "158"]);
  });

  it("finds a variant by size", () => {
    expect(findVariantForOption(variants, "Size", "158")?.id).toBe(
      "gid://shopify/ProductVariant/3",
    );
  });

  it("reports availability per size", () => {
    expect(isOptionValueAvailable(variants, "Size", "152")).toBe(true);
    expect(isOptionValueAvailable(variants, "Size", "156")).toBe(false);
  });

  it("returns null option name for empty variants", () => {
    expect(resolveQuickAddOptionName([])).toBeNull();
  });
});
