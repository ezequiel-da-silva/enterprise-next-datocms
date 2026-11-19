import { describe, expect, it } from "vitest";
import { computeFreeShippingProgress } from "@/lib/shopify/free-shipping-progress";

describe("computeFreeShippingProgress", () => {
  it("returns progress with remaining amount and ratio under threshold", () => {
    expect(
      computeFreeShippingProgress({
        subtotal: 100,
        threshold: 250,
        currencyOk: true,
        shippingRate: "15.00",
      }),
    ).toEqual({ kind: "progress", remaining: 150, ratio: 0.4, unlocked: false });
  });

  it("marks unlocked when subtotal meets threshold", () => {
    expect(
      computeFreeShippingProgress({
        subtotal: 250,
        threshold: 250,
        currencyOk: true,
        shippingRate: null,
      }),
    ).toEqual({ kind: "progress", remaining: 0, ratio: 1, unlocked: true });
  });

  it("hides meter when currency does not match", () => {
    expect(
      computeFreeShippingProgress({
        subtotal: 100,
        threshold: 250,
        currencyOk: false,
        shippingRate: "0.00",
      }),
    ).toEqual({ kind: "simple_free" });
  });

  it("uses simple_free when flat free shipping and no threshold", () => {
    expect(
      computeFreeShippingProgress({
        subtotal: 10,
        threshold: null,
        currencyOk: true,
        shippingRate: "0.00",
      }),
    ).toEqual({ kind: "simple_free" });
  });

  it("hides when no threshold and paid shipping", () => {
    expect(
      computeFreeShippingProgress({
        subtotal: 10,
        threshold: 0,
        currencyOk: true,
        shippingRate: "9.90",
      }),
    ).toEqual({ kind: "hidden" });
  });
});
