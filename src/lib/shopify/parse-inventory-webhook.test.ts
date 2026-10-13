import { describe, expect, it } from "vitest";
import { isInventoryWebhookTopic, parseShopifyInventoryWebhook } from "@/lib/shopify/parse-inventory-webhook";

describe("parseShopifyInventoryWebhook", () => {
  it("accepts only inventory_levels/update", () => {
    expect(isInventoryWebhookTopic("inventory_levels/update")).toBe(true);
    expect(isInventoryWebhookTopic("inventory_levels/connect")).toBe(false);
    expect(isInventoryWebhookTopic(null)).toBe(false);
  });

  it("reads the inventory item id as number, string or GID", () => {
    expect(parseShopifyInventoryWebhook({ inventory_item_id: 271878346596884, available: 3 })).toEqual({
      inventoryItemId: "271878346596884",
    });
    expect(parseShopifyInventoryWebhook({ inventory_item_id: "42" })).toEqual({ inventoryItemId: "42" });
    expect(parseShopifyInventoryWebhook({ inventory_item_id: "gid://shopify/InventoryItem/7" })).toEqual({
      inventoryItemId: "7",
    });
  });

  it("rejects missing or malformed ids", () => {
    expect(parseShopifyInventoryWebhook(null)).toBeNull();
    expect(parseShopifyInventoryWebhook({})).toBeNull();
    expect(parseShopifyInventoryWebhook({ inventory_item_id: -1 })).toBeNull();
    expect(parseShopifyInventoryWebhook({ inventory_item_id: "1 OR 1=1" })).toBeNull();
    expect(parseShopifyInventoryWebhook({ inventory_item_id: "gid://shopify/Product/7" })).toBeNull();
  });
});
