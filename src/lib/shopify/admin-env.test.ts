import { afterEach, describe, expect, it } from "vitest";
import { readShopifyAdminEnv } from "@/lib/shopify/admin-env";

const KEYS = ["SHOPIFY_STORE_DOMAIN", "SHOPIFY_ADMIN_ACCESS_TOKEN"] as const;

describe("readShopifyAdminEnv", () => {
  afterEach(() => {
    for (const key of KEYS) delete process.env[key];
  });

  it("returns missing keys when Admin credentials are absent", () => {
    delete process.env.SHOPIFY_STORE_DOMAIN;
    delete process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
    const result = readShopifyAdminEnv();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.missing).toEqual([...KEYS].sort());
    }
  });

  it("normalizes the shop domain", () => {
    process.env.SHOPIFY_STORE_DOMAIN = " https://Shop.Myshopify.com/ ";
    process.env.SHOPIFY_ADMIN_ACCESS_TOKEN = " shpat_x ";
    expect(readShopifyAdminEnv()).toEqual({
      ok: true,
      data: {
        SHOPIFY_STORE_DOMAIN: "shop.myshopify.com",
        SHOPIFY_ADMIN_ACCESS_TOKEN: "shpat_x",
      },
    });
  });
});
