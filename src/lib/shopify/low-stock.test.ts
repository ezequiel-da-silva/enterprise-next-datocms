import { describe, expect, it } from "vitest";
import { LOW_STOCK_THRESHOLD, shouldShowLowStock } from "@/lib/shopify/low-stock";

describe("shouldShowLowStock", () => {
  it(`shows when quantity is 1..${LOW_STOCK_THRESHOLD}`, () => {
    expect(shouldShowLowStock(5)).toBe(true);
    expect(shouldShowLowStock(1)).toBe(true);
  });

  it("hides when out of stock, above threshold, or untracked", () => {
    expect(shouldShowLowStock(0)).toBe(false);
    expect(shouldShowLowStock(6)).toBe(false);
    expect(shouldShowLowStock(null)).toBe(false);
    expect(shouldShowLowStock(undefined)).toBe(false);
  });
});
