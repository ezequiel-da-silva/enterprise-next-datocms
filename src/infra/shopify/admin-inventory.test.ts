import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { productHandleForInventoryItem } from "@/infra/shopify/admin-inventory";
import { resetShopifyAdminTokenCacheForTests } from "@/infra/shopify/admin-access-token";

const KEYS = ["SHOPIFY_STORE_DOMAIN", "SHOPIFY_CLIENT_ID", "SHOPIFY_API_SECRET_KEY", "SHOPIFY_ADMIN_ACCESS_TOKEN"] as const;
const snapshot: Partial<Record<(typeof KEYS)[number], string | undefined>> = {};

describe("productHandleForInventoryItem", () => {
  beforeEach(() => {
    for (const key of KEYS) {
      snapshot[key] = process.env[key];
      delete process.env[key];
    }
    process.env.SHOPIFY_STORE_DOMAIN = "shop.myshopify.com";
    process.env.SHOPIFY_ADMIN_ACCESS_TOKEN = "shpat_admin";
    resetShopifyAdminTokenCacheForTests();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    for (const key of KEYS) {
      const previous = snapshot[key];
      if (previous === undefined) delete process.env[key];
      else process.env[key] = previous;
    }
  });

  it("resolves the product handle from the inventory item", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { inventoryItem: { variant: { product: { handle: "hat" } } } } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(productHandleForInventoryItem("42")).resolves.toBe("hat");
    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)) as { variables: { id: string } };
    expect(body.variables.id).toBe("gid://shopify/InventoryItem/42");
    expect(fetchMock.mock.calls[0]?.[1]?.headers).toMatchObject({ "X-Shopify-Access-Token": "shpat_admin" });
  });

  it("returns null when the item has no variant or the request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: async () => ({ data: { inventoryItem: null } }) })
        .mockResolvedValueOnce({ ok: false, json: async () => ({}) })
        .mockRejectedValueOnce(new Error("network")),
    );
    vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(productHandleForInventoryItem("1")).resolves.toBeNull();
    await expect(productHandleForInventoryItem("2")).resolves.toBeNull();
    await expect(productHandleForInventoryItem("3")).resolves.toBeNull();
  });

  it("rejects non-numeric ids without calling Shopify", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(productHandleForInventoryItem("1 OR 1")).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
