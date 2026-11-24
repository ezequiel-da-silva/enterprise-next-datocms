import { describe, expect, it } from "vitest";
import {
  normalizeProductTitlePt,
  productTitlePtFromHandle,
  productTitlePtNeedsUpdate,
} from "@/lib/i18n/normalize-product-title-pt";

describe("productTitlePtFromHandle", () => {
  it("maps collection and board handles", () => {
    expect(productTitlePtFromHandle("the-collection-snowboard-liquid")).toBe("Coleção Snowboard: Liquid");
    expect(productTitlePtFromHandle("the-complete-snowboard")).toBe("Prancha de Snowboard: Complete");
    expect(productTitlePtFromHandle("the-multi-managed-snowboard")).toBe(
      "Prancha de Snowboard: Multi Managed",
    );
    expect(productTitlePtFromHandle("gift-card")).toBeNull();
  });
});

describe("normalizeProductTitlePt", () => {
  it("prefers handle over noisy EN", () => {
    expect(
      normalizeProductTitlePt(
        "The Collection Snowboard: Liquid snow",
        "A coleção de snowboards: Liquid",
        "the-collection-snowboard-liquid",
      ),
    ).toBe("Coleção Snowboard: Liquid");
  });

  it("maps EN when handle is missing", () => {
    expect(normalizeProductTitlePt("The Collection Snowboard: Hydrogen")).toBe(
      "Coleção Snowboard: Hydrogen",
    );
    expect(normalizeProductTitlePt("The Videographer Snowboard")).toBe(
      "Prancha de Snowboard: Videographer",
    );
  });

  it("leaves already-normalized titles alone", () => {
    expect(
      normalizeProductTitlePt(
        "The Collection Snowboard: Liquid",
        "Coleção Snowboard: Liquid",
        "the-collection-snowboard-liquid",
      ),
    ).toBe("Coleção Snowboard: Liquid");
    expect(productTitlePtNeedsUpdate("Coleção Snowboard: Liquid", "Coleção Snowboard: Liquid")).toBe(
      false,
    );
  });

  it("skips non-snowboard products", () => {
    expect(normalizeProductTitlePt("Gift Card", "Gift Card", "gift-card")).toBeNull();
    expect(normalizeProductTitlePt("Selling Plans Ski Wax", null, "selling-plans-ski-wax")).toBeNull();
  });
});
