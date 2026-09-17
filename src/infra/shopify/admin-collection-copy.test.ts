import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { pushShopifyCollectionCopy } from "@/infra/shopify/admin-collection-copy";
import { resetShopifyAdminTokenCacheForTests } from "@/lib/shopify/admin-access-token";

const KEYS = [
  "SHOPIFY_STORE_DOMAIN",
  "SHOPIFY_CLIENT_ID",
  "SHOPIFY_API_SECRET_KEY",
  "SHOPIFY_ADMIN_ACCESS_TOKEN",
] as const;

const snapshot: Partial<Record<(typeof KEYS)[number], string | undefined>> = {};

function collectionPayload(title: string, descriptionHtml = "") {
  return {
    ok: true,
    json: async () => ({
      data: { collection: { id: "gid://shopify/Collection/1", title, descriptionHtml } },
    }),
  };
}

describe("pushShopifyCollectionCopy", () => {
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

  it("calls collectionUpdate when EN differs", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "shop.myshopify.com";
    process.env.SHOPIFY_ADMIN_ACCESS_TOKEN = "shpat_admin";
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(collectionPayload("Old"))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            collectionUpdate: {
              collection: { id: "gid://shopify/Collection/1", title: "New" },
              userErrors: [],
            },
          },
        }),
      });
    vi.stubGlobal("fetch", fetchMock);

    await expect(pushShopifyCollectionCopy("1", { en: "New" })).resolves.toEqual({
      ok: true,
      skipped: false,
      warnings: [],
    });
    const body = JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body));
    expect(body.variables.input).toMatchObject({
      id: "gid://shopify/Collection/1",
      title: "New",
    });
  });
});
