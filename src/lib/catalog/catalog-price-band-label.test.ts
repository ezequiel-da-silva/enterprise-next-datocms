import { describe, expect, it } from "vitest";
import { formatCatalogPriceBandLabel } from "@/lib/catalog/catalog-price-band-label";

describe("formatCatalogPriceBandLabel", () => {
  it("formats a bounded band in USD", () => {
    const label = formatCatalogPriceBandLabel("en", "200-500", "USD");
    expect(label).toContain("$200");
    expect(label).toContain("$500");
  });

  it("scales BRL bands by 5 and marks the open band with a plus", () => {
    const bounded = formatCatalogPriceBandLabel("pt", "0-200", "BRL");
    expect(bounded).toMatch(/1\.000/);
    const open = formatCatalogPriceBandLabel("pt", "1000-", "BRL");
    expect(open).toMatch(/5\.000/);
    expect(open.endsWith("+")).toBe(true);
  });
});
