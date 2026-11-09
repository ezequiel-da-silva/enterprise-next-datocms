import { describe, expect, it } from "vitest";
import {
  isOrderPaidWebhookTopic,
  parseShopifyOrderWebhook,
  sanitizeOrderDisplayName,
} from "@/lib/shopify/parse-order-webhook";

describe("isOrderPaidWebhookTopic", () => {
  it("accepts orders/paid only", () => {
    expect(isOrderPaidWebhookTopic("orders/paid")).toBe(true);
    expect(isOrderPaidWebhookTopic("orders/create")).toBe(false);
    expect(isOrderPaidWebhookTopic(null)).toBe(false);
  });
});

describe("sanitizeOrderDisplayName", () => {
  it("keeps order-like names and strips junk", () => {
    expect(sanitizeOrderDisplayName(" #1001 ")).toBe("#1001");
    expect(sanitizeOrderDisplayName('<script>alert(1)</script>')).toBe("scriptalert1/script");
    expect(sanitizeOrderDisplayName("")).toBeNull();
  });
});

describe("parseShopifyOrderWebhook", () => {
  it("maps REST order payload to GA4-ready fields", () => {
    expect(
      parseShopifyOrderWebhook({
        id: 555,
        name: "#1001",
        currency: "brl",
        total_price: "199.90",
        line_items: [
          {
            product_id: 11,
            sku: "BOARD-ICE",
            title: "The Complete Snowboard",
            variant_title: "Ice",
            quantity: 2,
            price: "99.95",
          },
        ],
      }),
    ).toEqual({
      id: "555",
      name: "#1001",
      currency: "brl",
      totalPrice: 199.9,
      items: [
        {
          item_id: "BOARD-ICE",
          item_name: "The Complete Snowboard",
          price: 99.95,
          quantity: 2,
          item_variant: "Ice",
        },
      ],
    });
  });

  it("rejects incomplete payloads", () => {
    expect(parseShopifyOrderWebhook(null)).toBeNull();
    expect(parseShopifyOrderWebhook({ id: 1 })).toBeNull();
  });
});
