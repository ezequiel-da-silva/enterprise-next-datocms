import { afterEach, describe, expect, it } from "vitest";
import { cartCookieOptions, cartPath, isCartEnabled } from "@/lib/shopify/cart-cookie";

describe("cart cookie", () => {
  afterEach(() => {
    delete process.env.SHOPIFY_CART_ENABLED;
  });

  it("is httpOnly, lax and secure only in production", () => {
    expect(cartCookieOptions(true)).toMatchObject({ httpOnly: true, secure: true, sameSite: "lax", path: "/" });
    expect(cartCookieOptions(false).secure).toBe(false);
    expect(cartCookieOptions(true).maxAge).toBe(1_209_600);
  });

  it("reads the feature flag", () => {
    expect(isCartEnabled()).toBe(false);
    process.env.SHOPIFY_CART_ENABLED = "1";
    expect(isCartEnabled()).toBe(true);
    process.env.SHOPIFY_CART_ENABLED = "TRUE";
    expect(isCartEnabled()).toBe(true);
    process.env.SHOPIFY_CART_ENABLED = "0";
    expect(isCartEnabled()).toBe(false);
  });

  it("builds the cart path", () => {
    expect(cartPath("pt")).toBe("/pt/cart");
  });
});
