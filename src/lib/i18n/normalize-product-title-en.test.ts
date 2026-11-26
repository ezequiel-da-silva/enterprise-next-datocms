import { describe, expect, it } from "vitest";
import {
  normalizeProductTitleEn,
  productTitleEnNeedsUpdate,
} from "@/lib/i18n/normalize-product-title-en";

describe("normalizeProductTitleEn", () => {
  it("strips trailing junk on collection titles", () => {
    expect(normalizeProductTitleEn("The Collection Snowboard: Liquid snow")).toBe(
      "The Collection Snowboard: Liquid",
    );
  });

  it("keeps clean collection titles", () => {
    expect(normalizeProductTitleEn("The Collection Snowboard: Hydrogen")).toBe(
      "The Collection Snowboard: Hydrogen",
    );
    expect(
      productTitleEnNeedsUpdate(
        "The Collection Snowboard: Hydrogen",
        normalizeProductTitleEn("The Collection Snowboard: Hydrogen"),
      ),
    ).toBe(false);
  });

  it("strips trailing junk when snowboard appears elsewhere", () => {
    expect(normalizeProductTitleEn("The Complete Snowboard snow")).toBe("The Complete Snowboard");
  });

  it("returns null for empty input", () => {
    expect(normalizeProductTitleEn("  ")).toBeNull();
    expect(productTitleEnNeedsUpdate("Liquid snow", null)).toBe(false);
  });
});
