import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readShopifyAdminCredentials, readShopifyAdminTokenOverride } from "@/lib/shopify/admin-env";

const KEYS = ["SHOPIFY_STORE_DOMAIN", "SHOPIFY_CLIENT_ID", "SHOPIFY_API_SECRET_KEY", "SHOPIFY_ADMIN_ACCESS_TOKEN"] as const;

const snapshot: Partial<Record<(typeof KEYS)[number], string | undefined>> = {};

describe("readShopifyAdminCredentials", () => {
  beforeEach(() => {
    for (const key of KEYS) {
      snapshot[key] = process.env[key];
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const key of KEYS) {
      const previous = snapshot[key];
      if (previous === undefined) delete process.env[key];
      else process.env[key] = previous;
    }
  });

  it("returns missing keys when app credentials are absent", () => {
    for (const key of KEYS) delete process.env[key];
    const result = readShopifyAdminCredentials();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.missing).toEqual(["SHOPIFY_API_SECRET_KEY", "SHOPIFY_CLIENT_ID", "SHOPIFY_STORE_DOMAIN"]);
    }
  });

  it("does not require SHOPIFY_ADMIN_ACCESS_TOKEN", () => {
    process.env.SHOPIFY_STORE_DOMAIN = " https://Shop.Myshopify.com/ ";
    process.env.SHOPIFY_CLIENT_ID = " client ";
    process.env.SHOPIFY_API_SECRET_KEY = " secret ";
    delete process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
    expect(readShopifyAdminCredentials()).toEqual({
      ok: true,
      data: {
        SHOPIFY_STORE_DOMAIN: "shop.myshopify.com",
        SHOPIFY_CLIENT_ID: "client",
        SHOPIFY_API_SECRET_KEY: "secret",
      },
    });
    expect(readShopifyAdminTokenOverride()).toBeUndefined();
  });

  it("reads the optional static override", () => {
    process.env.SHOPIFY_ADMIN_ACCESS_TOKEN = " shpat_x ";
    expect(readShopifyAdminTokenOverride()).toBe("shpat_x");
  });
});
