import { afterEach, describe, expect, it, vi } from "vitest";
import { pushShopifyProductTitle } from "@/infra/shopify/admin-product-title";

describe("pushShopifyProductTitle", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.SHOPIFY_STORE_DOMAIN;
    delete process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  });

  it("returns not_configured without Admin token", async () => {
    delete process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
    process.env.SHOPIFY_STORE_DOMAIN = "shop.myshopify.com";
    await expect(pushShopifyProductTitle("1", "Hat")).resolves.toEqual({
      ok: false,
      reason: "not_configured",
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
});
