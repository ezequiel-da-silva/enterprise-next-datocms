import { describe, expect, it } from "vitest";
import {
  extractCatalogSizesFromOptions,
  normalizeCatalogSizeKey,
} from "@/lib/shopify/catalog-size-options";

describe("normalizeCatalogSizeKey", () => {
  it("keeps digits and optional decimals, dropping the cm suffix and spaces", () => {
    expect(normalizeCatalogSizeKey("152")).toBe("152");
    expect(normalizeCatalogSizeKey(" 156 cm ")).toBe("156");
    expect(normalizeCatalogSizeKey("159.5")).toBe("159.5");
    expect(normalizeCatalogSizeKey("159.5CM")).toBe("159.5");
  });

  it("rejects non-length values", () => {
    expect(normalizeCatalogSizeKey("")).toBeNull();
    expect(normalizeCatalogSizeKey("XL")).toBeNull();
    expect(normalizeCatalogSizeKey("Default Title")).toBeNull();
    expect(normalizeCatalogSizeKey("156 wide")).toBeNull();
    expect(normalizeCatalogSizeKey("-156")).toBeNull();
  });
});

describe("extractCatalogSizesFromOptions", () => {
  it("reads Size / Length / Tamanho / Comprimento options (case-insensitive)", () => {
    expect(
      extractCatalogSizesFromOptions([
        [{ name: "Size", value: "156" }],
        [{ name: "LENGTH", value: "152 cm" }],
        [{ name: "Tamanho", value: "159" }],
        [{ name: "comprimento", value: "162" }],
      ]),
    ).toEqual(["152", "156", "159", "162"]);
  });

  it("accepts Title only when the value is a numeric board length", () => {
    expect(
      extractCatalogSizesFromOptions([
        [{ name: "Title", value: "155" }],
        [{ name: "Title", value: "Default Title" }],
        [{ name: "Title", value: "Midnight Blue" }],
      ]),
    ).toEqual(["155"]);
  });

  it("ignores non-size options such as Color and non-numeric size labels", () => {
    expect(
      extractCatalogSizesFromOptions([
        [
          { name: "Color", value: "160" },
          { name: "Size", value: "M" },
        ],
      ]),
    ).toEqual([]);
  });

  it("ignores Default Title even under a size option name", () => {
    expect(extractCatalogSizesFromOptions([[{ name: "Size", value: "Default Title" }]])).toEqual([]);
  });

  it("dedupes and sorts numerically across variants", () => {
    expect(
      extractCatalogSizesFromOptions([
        [{ name: "Size", value: "159" }],
        [{ name: "Size", value: "152" }],
        [{ name: "Size", value: "159 cm" }],
        [{ name: "Size", value: "1000" }],
        [{ name: "Size", value: "99" }],
      ]),
    ).toEqual(["99", "152", "159", "1000"]);
  });

  it("returns an empty list for no variants", () => {
    expect(extractCatalogSizesFromOptions([])).toEqual([]);
    expect(extractCatalogSizesFromOptions([[]])).toEqual([]);
  });
});
