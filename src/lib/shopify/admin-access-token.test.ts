import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  resetShopifyAdminTokenCacheForTests,
  resolveAdminAccessToken,
  seedShopifyAdminTokenCacheForTests,
} from "@/lib/shopify/admin-access-token";

const KEYS = [
  "SHOPIFY_STORE_DOMAIN",
  "SHOPIFY_CLIENT_ID",
  "SHOPIFY_API_SECRET_KEY",
  "SHOPIFY_ADMIN_ACCESS_TOKEN",
] as const;

const snapshot: Partial<Record<(typeof KEYS)[number], string | undefined>> = {};

function oauthOk(token = "oauth-token", expiresIn = 86400) {
  return {
    ok: true,
    json: async () => ({ access_token: token, expires_in: expiresIn, scope: "write_products" }),
  };
}

describe("resolveAdminAccessToken", () => {
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
    const result = await resolveAdminAccessToken();
    expect(result).toEqual({
      ok: false,
      reason: "not_configured",
      missing: ["SHOPIFY_API_SECRET_KEY", "SHOPIFY_CLIENT_ID", "SHOPIFY_STORE_DOMAIN"],
    });
  });

  it("uses the static override and skips OAuth", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "shop.myshopify.com";
    process.env.SHOPIFY_ADMIN_ACCESS_TOKEN = "shpat_static";
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(resolveAdminAccessToken()).resolves.toEqual({
      ok: true,
      domain: "shop.myshopify.com",
      token: "shpat_static",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fetches client credentials and reuses the cache on the next call", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "shop.myshopify.com";
    process.env.SHOPIFY_CLIENT_ID = "cid";
    process.env.SHOPIFY_API_SECRET_KEY = "secret";
    const fetchMock = vi.fn().mockResolvedValue(oauthOk());
    vi.stubGlobal("fetch", fetchMock);

    const first = await resolveAdminAccessToken();
    const second = await resolveAdminAccessToken();
    expect(first).toEqual({ ok: true, domain: "shop.myshopify.com", token: "oauth-token" });
    expect(second).toEqual(first);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("/admin/oauth/access_token");
  });

  it("refreshes when the cached token is inside the 60s skew", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "shop.myshopify.com";
    process.env.SHOPIFY_CLIENT_ID = "cid";
    process.env.SHOPIFY_API_SECRET_KEY = "secret";
    seedShopifyAdminTokenCacheForTests("stale-token", Date.now() + 30_000);
    const fetchMock = vi.fn().mockResolvedValue(oauthOk("fresh-token"));
    vi.stubGlobal("fetch", fetchMock);

    await expect(resolveAdminAccessToken()).resolves.toMatchObject({ token: "fresh-token" });
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
