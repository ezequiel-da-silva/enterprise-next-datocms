import { describe, expect, it } from "vitest";
import { backInStockSchema } from "@/core/entities/back-in-stock";

describe("backInStockSchema", () => {
  it("accepts a valid payload", () => {
    expect(
      backInStockSchema.safeParse({
        email: "rider@example.com",
        variantId: "gid://shopify/ProductVariant/1",
        productHandle: "board",
        locale: "pt",
      }).success,
    ).toBe(true);
  });

  it("rejects invalid email and empty ids", () => {
    expect(
      backInStockSchema.safeParse({
        email: "not-an-email",
        variantId: "gid://shopify/ProductVariant/1",
        productHandle: "board",
        locale: "en",
      }).success,
    ).toBe(false);
    expect(
      backInStockSchema.safeParse({
        email: "ok@example.com",
        variantId: "",
        productHandle: "board",
        locale: "en",
      }).success,
    ).toBe(false);
  });
});
