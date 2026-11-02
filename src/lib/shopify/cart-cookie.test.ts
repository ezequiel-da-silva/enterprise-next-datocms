import { afterEach, describe, expect, it } from "vitest";
import { cartCookieOptions, cartPath, isCartEnabled, readCartCountCookie } from "@/lib/shopify/cart-cookie";

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

  it("reads a badge count of 0 to 999", () => {
    expect(readCartCountCookie(undefined)).toBe(0);
    expect(readCartCountCookie("")).toBe(0);
    expect(readCartCountCookie("3")).toBe(3);
    expect(readCartCountCookie("999")).toBe(999);
    expect(readCartCountCookie("1000")).toBe(0);
    expect(readCartCountCookie("01")).toBe(1);
    expect(readCartCountCookie("-1")).toBe(0);
    expect(readCartCountCookie("2.5")).toBe(0);
    expect(readCartCountCookie("1e2")).toBe(0);
  });
});
