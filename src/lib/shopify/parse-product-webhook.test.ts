import { describe, expect, it } from "vitest";
import {
  isProductWebhookTopic,
  normalizeShopDomain,
  normalizeShopifyTopic,
  parseShopifyProductWebhook,
} from "@/lib/shopify/parse-product-webhook";

describe("Shopify product webhook parsing", () => {
  it("normalizes topic and shop domain", () => {
    expect(normalizeShopifyTopic("products/update;format=json")).toBe("products/update");
    expect(isProductWebhookTopic("products/create")).toBe(true);
    expect(isProductWebhookTopic("orders/create")).toBe(false);
    expect(normalizeShopDomain("https://Shop.myshopify.com/")).toBe("shop.myshopify.com");
  });

  it("reads numeric id, GID, handle and title", () => {
    expect(parseShopifyProductWebhook({ id: 99, handle: "hat", title: "Hat" })).toEqual({
      id: "99",
      handle: "hat",
      title: "Hat",
    });
    expect(
      parseShopifyProductWebhook({
        id: "gid://shopify/Product/77",
        handle: " mug ",
        title: "Mug",
      }),
    ).toEqual({ id: "77", handle: "mug", title: "Mug" });
  });

  it("rejects missing id or handle", () => {
    expect(parseShopifyProductWebhook({ handle: "x" })).toBeNull();
    expect(parseShopifyProductWebhook({ id: 1 })).toBeNull();
  });
});
