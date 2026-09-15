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

function i18nPayload(options: {
  title: string;
  digest?: string;
  shopLocales?: string[];
  pt?: string | null;
  es?: string | null;
}) {
  return {
    ok: true,
    json: async () => ({
      data: {
        product: { id: "gid://shopify/Product/1", title: options.title },
        shopLocales: (options.shopLocales ?? ["en", "pt", "es"]).map((locale) => ({
          locale,
          published: true,
        })),
        translatableResource: {
          translatableContent: [{ key: "title", value: options.title, digest: options.digest ?? "digest-1", locale: "en" }],
          pt: options.pt ? [{ key: "title", value: options.pt }] : [],
          ptBR: [],
          es: options.es ? [{ key: "title", value: options.es }] : [],
          esES: [],
        },
      },
    }),
  };
}

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
    await expect(pushShopifyProductTitle("1", { en: "Hat" })).resolves.toEqual({
      ok: false,
      reason: "not_configured",
      missing: ["SHOPIFY_API_SECRET_KEY", "SHOPIFY_CLIENT_ID", "SHOPIFY_STORE_DOMAIN"],
    });
  });

  it("skips productUpdate and translationsRegister when all titles already match", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "shop.myshopify.com";
    process.env.SHOPIFY_ADMIN_ACCESS_TOKEN = "shpat_admin";
    const fetchMock = vi.fn().mockResolvedValue(
      i18nPayload({ title: "Hat EN", pt: "Chapéu", es: "Sombrero" }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      pushShopifyProductTitle("1", { en: "Hat EN", ptBR: "Chapéu", es: "Sombrero" }),
    ).resolves.toEqual({ ok: true, skipped: true });
    expect(fetchMock).toHaveBeenCalledOnce();
    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
    expect(body.query).toMatch(/ProductTitleI18n/);
  });

  it("calls productUpdate when EN differs", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "https://shop.myshopify.com/";
    process.env.SHOPIFY_ADMIN_ACCESS_TOKEN = "shpat_admin";
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(i18nPayload({ title: "Old" }))
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

    await expect(pushShopifyProductTitle("9", { en: "New" })).resolves.toEqual({ ok: true, skipped: false });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const updateBody = JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body));
    expect(updateBody.variables.product).toEqual({
      id: "gid://shopify/Product/9",
      title: "New",
    });
  });

  it("registers PT/ES translations when they differ", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "shop.myshopify.com";
    process.env.SHOPIFY_ADMIN_ACCESS_TOKEN = "shpat_admin";
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(i18nPayload({ title: "Hat EN", pt: "Chapéu", es: null }))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { translationsRegister: { translations: [{ key: "title", locale: "es" }], userErrors: [] } },
        }),
      });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      pushShopifyProductTitle("1", { en: "Hat EN", ptBR: "Chapéu", es: "Sombrero" }),
    ).resolves.toEqual({ ok: true, skipped: false });
    const registerBody = JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body));
    expect(registerBody.query).toMatch(/translationsRegister/);
    expect(registerBody.variables.translations).toEqual([
      {
        key: "title",
        locale: "es",
        value: "Sombrero",
        translatableContentDigest: "digest-1",
      },
    ]);
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
      .mockResolvedValueOnce(i18nPayload({ title: "Hat EN" }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(pushShopifyProductTitle("1", { en: "Hat EN" })).resolves.toEqual({ ok: true, skipped: true });
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("/admin/oauth/access_token");
    expect(fetchMock.mock.calls[1]?.[1]?.headers).toMatchObject({
      "X-Shopify-Access-Token": "oauth-token",
    });
  });
});
