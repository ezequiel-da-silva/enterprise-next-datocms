import { afterEach, describe, expect, it } from "vitest";
import { readShopifyWebhookEnv } from "@/lib/shopify/env";

const KEYS = [
  "SHOPIFY_CLIENT_ID",
  "SHOPIFY_API_SECRET_KEY",
  "SHOPIFY_STORE_DOMAIN",
  "DATOCMS_USER_REVIEWS_CDA_TOKEN",
] as const;

const snapshot: Partial<Record<(typeof KEYS)[number], string | undefined>> = {};

describe("readShopifyWebhookEnv", () => {
  afterEach(() => {
    for (const key of KEYS) {
      const previous = snapshot[key];
      if (previous === undefined) delete process.env[key];
      else process.env[key] = previous;
    }
  });

  it("returns missing keys when Dev Dashboard or CMA secrets are absent", () => {
    for (const key of KEYS) {
      snapshot[key] = process.env[key];
      delete process.env[key];
    }
    const result = readShopifyWebhookEnv();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.missing).toEqual([...KEYS].sort());
    }
  });

  it("parses trimmed Dev Dashboard credentials", () => {
    for (const key of KEYS) snapshot[key] = process.env[key];
    process.env.SHOPIFY_CLIENT_ID = " client-id ";
    process.env.SHOPIFY_API_SECRET_KEY = " secret ";
    process.env.SHOPIFY_STORE_DOMAIN = " teste-datocms-ezequiel.myshopify.com ";
    process.env.DATOCMS_USER_REVIEWS_CDA_TOKEN = " cma ";
    const result = readShopifyWebhookEnv();
    expect(result).toEqual({
      ok: true,
      data: {
        SHOPIFY_CLIENT_ID: "client-id",
        SHOPIFY_API_SECRET_KEY: "secret",
        SHOPIFY_STORE_DOMAIN: "teste-datocms-ezequiel.myshopify.com",
        DATOCMS_USER_REVIEWS_CDA_TOKEN: "cma",
      },
    });
  });
});
