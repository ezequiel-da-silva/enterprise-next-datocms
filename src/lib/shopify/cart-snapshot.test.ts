import { describe, expect, it } from "vitest";
import { toCartSnapshot } from "@/lib/shopify/cart-snapshot";
import type { StorefrontCart } from "@/infra/shopify/cart";

const cart: StorefrontCart = {
  id: "gid://shopify/Cart/abc",
  checkoutUrl: "https://shop.myshopify.com/cart/c/abc",
  totalQuantity: 2,
  countryCode: "US",
  subtotal: { amount: "20.00", currencyCode: "USD" },
  total: { amount: "20.00", currencyCode: "USD" },
  lines: [
    {
      id: "gid://shopify/CartLine/1",
      quantity: 2,
      variantId: "gid://shopify/ProductVariant/1",
      variantTitle: "Default",
      selectedOptions: [],
      productTitle: "Hat",
      productHandle: "hat",
      unitPrice: { amount: "10.00", currencyCode: "USD" },
      total: { amount: "20.00", currencyCode: "USD" },
      image: { url: "https://cdn.shopify.com/hat.jpg", altText: "Hat", width: 100, height: 100 },
    },
  ],
};

describe("toCartSnapshot", () => {
  it("strips infra-only fields and keeps checkout url", () => {
    expect(toCartSnapshot(cart)).toEqual({
      id: cart.id,
      totalQuantity: 2,
      checkoutUrl: cart.checkoutUrl,
      subtotal: { amount: "20.00", currencyCode: "USD" },
      lines: [
        {
          id: "gid://shopify/CartLine/1",
          quantity: 2,
          productTitle: "Hat",
          productHandle: "hat",
          variantTitle: "Default",
          unitPrice: { amount: "10.00", currencyCode: "USD" },
          total: { amount: "20.00", currencyCode: "USD" },
          image: { url: "https://cdn.shopify.com/hat.jpg", alt: "Hat" },
        },
      ],
    });
  });
});
