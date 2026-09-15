import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { pushShopifyProductTitle } from "@/infra/shopify/admin-product-title";
import { resetShopifyAdminTokenCacheForTests } from "@/lib/shopify/admin-access-token";

const KEYS = [
  "SHOPIFY_STORE_DOMAIN",
  "SHOPIFY_CLIENT_ID",
  "SHOPIFY_API_SECRET_KEY",
  "SHOPIFY_ADMIN_ACCESS_TOKEN",
] as const;

const snapshot: Partial<Record<(typeof KEYS)[number], string | undefined>> = {};

describe("pushShopifyProductTitle", () => {
  beforeEach(() => {
    for (const key of KEYS) {
      snapshot[key] = process.env[key];
      delete process.env[key];
    }
    resetShopifyAdminTokenCacheForTests();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    resetShopifyAdminTokenCacheForTests();
    for (const key of KEYS) {
      const previous = snapshot[key];
      if (previous === undefined) delete process.env[key];
      else process.env[key] = previous;
    }
  });

  it("returns not_configured without client credentials or override", async () => {
    await expect(pushShopifyProductTitle("1", "Hat")).resolves.toEqual({
      ok: false,
      reason: "not_configured",
      missing: ["SHOPIFY_API_SECRET_KEY", "SHOPIFY_CLIENT_ID", "SHOPIFY_STORE_DOMAIN"],
    });
  });

  it("skips productUpdate when Shopify title already matches", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "shop.myshopify.com";
    process.env.SHOPIFY_ADMIN_ACCESS_TOKEN = "shpat_admin";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { product: { id: "gid://shopify/Product/1", title: "Hat EN" } } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(pushShopifyProductTitle("1", "Hat EN")).resolves.toEqual({ ok: true, skipped: true });
    expect(fetchMock).toHaveBeenCalledOnce();
    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
    expect(body.query).toMatch(/ProductTitle/);
  });

  it("calls productUpdate when titles differ", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "https://shop.myshopify.com/";
    process.env.SHOPIFY_ADMIN_ACCESS_TOKEN = "shpat_admin";
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { product: { id: "gid://shopify/Product/9", title: "Old" } } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            productUpdate: {
              product: { id: "gid://shopify/Product/9", title: "New" },
              userErrors: [],
            },
          },
        }),
      });
    vi.stubGlobal("fetch", fetchMock);

    await expect(pushShopifyProductTitle("9", "New")).resolves.toEqual({ ok: true, skipped: false });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const updateBody = JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body));
    expect(updateBody.variables.product).toEqual({
      id: "gid://shopify/Product/9",
      title: "New",
    });
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("shop.myshopify.com/admin/api/2026-07/graphql.json");
  });

  it("obtains a token via client credentials when the override is unset", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "shop.myshopify.com";
    process.env.SHOPIFY_CLIENT_ID = "cid";
    process.env.SHOPIFY_API_SECRET_KEY = "secret";
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: "oauth-token", expires_in: 86400 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { product: { id: "gid://shopify/Product/1", title: "Hat EN" } } }),
      });
    vi.stubGlobal("fetch", fetchMock);

    await expect(pushShopifyProductTitle("1", "Hat EN")).resolves.toEqual({ ok: true, skipped: true });
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("/admin/oauth/access_token");
    expect(fetchMock.mock.calls[1]?.[1]?.headers).toMatchObject({
      "X-Shopify-Access-Token": "oauth-token",
    });
  });
});
