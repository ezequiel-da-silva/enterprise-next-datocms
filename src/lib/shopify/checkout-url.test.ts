import { describe, expect, it } from "vitest";
import { safeCheckoutUrl } from "@/lib/shopify/checkout-url";

describe("safeCheckoutUrl", () => {
  it("accepts the store domain, custom checkout domain and myshopify.com", () => {
    expect(safeCheckoutUrl("https://shop.example.com/cart/c/abc?key=1", ["shop.example.com"])).toBe(
      "https://shop.example.com/cart/c/abc?key=1",
    );
    expect(safeCheckoutUrl("https://checkout.brand.com/cart/c/abc", ["x.myshopify.com", "https://checkout.brand.com/"])).toBe(
      "https://checkout.brand.com/cart/c/abc",
    );
    expect(safeCheckoutUrl("https://my-store.myshopify.com/cart/c/abc", [])).toBe(
      "https://my-store.myshopify.com/cart/c/abc",
    );
  });

  it("rejects other hosts, http and non-URLs", () => {
    expect(safeCheckoutUrl("https://evil.com/cart", ["shop.example.com"])).toBeNull();
    expect(safeCheckoutUrl("https://myshopify.com.evil.com/cart", [])).toBeNull();
    expect(safeCheckoutUrl("http://shop.example.com/cart", ["shop.example.com"])).toBeNull();
    expect(safeCheckoutUrl("javascript:alert(1)", ["shop.example.com"])).toBeNull();
    expect(safeCheckoutUrl(null, ["shop.example.com"])).toBeNull();
  });
});
