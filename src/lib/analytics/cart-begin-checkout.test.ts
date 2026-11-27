import { describe, expect, it } from "vitest";
import { cartBeginCheckoutPayload } from "@/lib/analytics/cart-begin-checkout";

describe("cartBeginCheckoutPayload", () => {
  it("returns null without a subtotal", () => {
    expect(
      cartBeginCheckoutPayload({
        subtotal: null,
        lines: [{ productHandle: "a", productTitle: "A", unitPrice: { amount: "10" }, quantity: 1 }],
      }),
    ).toBeNull();
  });

  it("maps subtotal and lines to a begin_checkout payload", () => {
    expect(
      cartBeginCheckoutPayload({
        subtotal: { amount: "25.50", currencyCode: "brl" },
        lines: [
          {
            productHandle: "board",
            productTitle: "Board",
            unitPrice: { amount: "12.75" },
            quantity: 2,
            variantTitle: "158",
          },
          {
            productHandle: "wax",
            productTitle: "Wax",
            unitPrice: { amount: "0" },
            quantity: 1,
            variantTitle: null,
          },
        ],
      }),
    ).toEqual({
      currency: "brl",
      value: 25.5,
      items: [
        {
          item_id: "board",
          item_name: "Board",
          price: 12.75,
          quantity: 2,
          item_variant: "158",
        },
        {
          item_id: "wax",
          item_name: "Wax",
          price: 0,
          quantity: 1,
          item_variant: undefined,
        },
      ],
    });
  });
});
