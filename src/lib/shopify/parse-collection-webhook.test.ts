import { describe, expect, it } from "vitest";
import {
  isCollectionWebhookTopic,
  parseShopifyCollectionWebhook,
} from "@/lib/shopify/parse-collection-webhook";
import { shouldSkipShopifyCollectionHandle } from "@/lib/shopify/skip-collection-handle";

describe("Shopify collection webhook parsing", () => {
  it("accepts collection topics", () => {
    expect(isCollectionWebhookTopic("collections/create")).toBe(true);
    expect(isCollectionWebhookTopic("products/update")).toBe(false);
  });

  it("reads numeric id, GID, handle, title and body_html", () => {
    expect(
      parseShopifyCollectionWebhook({
        id: "gid://shopify/Collection/77",
        handle: " hydrogen ",
        title: "Hydrogen",
        body_html: "<p>Boards.</p>",
      }),
    ).toEqual({
      id: "77",
      handle: "hydrogen",
      title: "Hydrogen",
      description: "Boards.",
    });
  });

  it("rejects missing id or handle", () => {
    expect(parseShopifyCollectionWebhook({ handle: "x" })).toBeNull();
  });
});

describe("shouldSkipShopifyCollectionHandle", () => {
  it("skips storefront home collections", () => {
    expect(shouldSkipShopifyCollectionHandle("frontpage")).toBe(true);
    expect(shouldSkipShopifyCollectionHandle("Home-Page")).toBe(true);
    expect(shouldSkipShopifyCollectionHandle("hydrogen")).toBe(false);
  });
});
