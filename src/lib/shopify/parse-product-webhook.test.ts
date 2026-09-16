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
      description: "",
    });
    expect(
      parseShopifyProductWebhook({
        id: "gid://shopify/Product/77",
        handle: " mug ",
        title: "Mug",
      }),
    ).toEqual({ id: "77", handle: "mug", title: "Mug", description: "" });
  });

  it("reads body_html as plain description", () => {
    expect(
      parseShopifyProductWebhook({
        id: 1,
        handle: "board",
        title: "Board",
        body_html: "<p>Carves well.</p>",
      }),
    ).toEqual({
      id: "1",
      handle: "board",
      title: "Board",
      description: "Carves well.",
    });
  });

  it("rejects missing id or handle", () => {
    expect(parseShopifyProductWebhook({ handle: "x" })).toBeNull();
    expect(parseShopifyProductWebhook({ id: 1 })).toBeNull();
  });
});
