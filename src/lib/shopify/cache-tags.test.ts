import { describe, expect, it } from "vitest";
import { SHOPIFY_CATALOG_TAG, SHOPIFY_PRODUCTS_TAG, shopifyProductTag } from "@/lib/shopify/cache-tags";

describe("Shopify cache tags", () => {
  it("builds a stable per-product tag", () => {
    expect(shopifyProductTag(" The-Hat ")).toBe("shopify:product:the-hat");
  });

  it("keeps the broad tags distinct from product tags", () => {
    expect(SHOPIFY_PRODUCTS_TAG).not.toBe(SHOPIFY_CATALOG_TAG);
    expect(shopifyProductTag("products")).not.toBe(SHOPIFY_PRODUCTS_TAG);
  });
});
