import { describe, expect, it } from "vitest";
import {
  addToCartSchema,
  cartIdSchema,
  isShopifyVariantId,
  removeCartLineSchema,
  updateCartLineSchema,
} from "@/core/entities/cart";

describe("cart entity", () => {
  it("accepts Shopify cart ids with key query", () => {
    expect(cartIdSchema.safeParse("gid://shopify/Cart/c1-abc123?key=deadbeef").success).toBe(true);
    expect(cartIdSchema.safeParse("gid://shopify/Product/1").success).toBe(false);
    expect(cartIdSchema.safeParse("javascript:alert(1)").success).toBe(false);
  });

  it("validates add-to-cart input and coerces quantity", () => {
    const ok = addToCartSchema.safeParse({ variantId: "gid://shopify/ProductVariant/42", quantity: "2" });
    expect(ok.success && ok.data.quantity).toBe(2);
    expect(addToCartSchema.safeParse({ variantId: "gid://shopify/ProductVariant/42", quantity: "0" }).success).toBe(false);
    expect(addToCartSchema.safeParse({ variantId: "gid://shopify/ProductVariant/42", quantity: "100" }).success).toBe(false);
    expect(addToCartSchema.safeParse({ variantId: "gid://shopify/Product/42", quantity: "1" }).success).toBe(false);
  });

  it("allows quantity 0 on update (removes line) and validates line ids", () => {
    expect(updateCartLineSchema.safeParse({ lineId: "gid://shopify/CartLine/abc-1?cart=x", quantity: "0" }).success).toBe(
      true,
    );
    expect(updateCartLineSchema.safeParse({ lineId: "nope", quantity: "1" }).success).toBe(false);
    expect(removeCartLineSchema.safeParse({ lineId: "gid://shopify/CartLine/abc" }).success).toBe(true);
  });

  it("detects real Shopify variant ids", () => {
    expect(isShopifyVariantId("gid://shopify/ProductVariant/123")).toBe(true);
    expect(isShopifyVariantId("gid://shopify/Product/123")).toBe(false);
  });
});
