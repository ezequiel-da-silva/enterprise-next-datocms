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

function productPayload(title: string) {
  return {
    ok: true,
    json: async () => ({
      data: { product: { id: "gid://shopify/Product/1", title } },
    }),
  };
}

function i18nPayload(options: {
  digest?: string;
  shopLocales?: string[];
  pt?: string | null;
  es?: string | null;
}) {
  return {
    ok: true,
    json: async () => ({
      data: {
        shopLocales: (options.shopLocales ?? ["en", "pt", "es"]).map((locale) => ({
          locale,
          published: true,
        })),
        translatableResource: {
          translatableContent: [{ key: "title", value: "Hat EN", digest: options.digest ?? "digest-1", locale: "en" }],
          pt: options.pt ? [{ key: "title", value: options.pt }] : [],
          ptBR: [],
          es: options.es ? [{ key: "title", value: options.es }] : [],
          esES: [],
        },
      },
    }),
  };
}

/** Shopify responde 200 com `errors` quando falta um scope. */
function accessDenied(message: string) {
  return {
    ok: true,
    json: async () => ({ data: null, errors: [{ message }] }),
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

  function useAdminToken(): void {
    process.env.SHOPIFY_STORE_DOMAIN = "shop.myshopify.com";
    process.env.SHOPIFY_ADMIN_ACCESS_TOKEN = "shpat_admin";
  }

  it("returns not_configured without client credentials or override", async () => {
    await expect(pushShopifyProductTitle("1", { en: "Hat" })).resolves.toEqual({
      ok: false,
      reason: "not_configured",
      missing: ["SHOPIFY_API_SECRET_KEY", "SHOPIFY_CLIENT_ID", "SHOPIFY_STORE_DOMAIN"],
    });
  });

  it("skips every write when all titles already match", async () => {
    useAdminToken();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(productPayload("Hat EN"))
      .mockResolvedValueOnce(i18nPayload({ pt: "Chapéu", es: "Sombrero" }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      pushShopifyProductTitle("1", { en: "Hat EN", ptBR: "Chapéu", es: "Sombrero" }),
    ).resolves.toEqual({ ok: true, skipped: true, warnings: [] });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not read translations when only EN is provided", async () => {
    useAdminToken();
    const fetchMock = vi.fn().mockResolvedValueOnce(productPayload("Hat EN"));
    vi.stubGlobal("fetch", fetchMock);

    await expect(pushShopifyProductTitle("1", { en: "Hat EN" })).resolves.toEqual({
      ok: true,
      skipped: true,
      warnings: [],
    });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("calls productUpdate when EN differs", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "https://shop.myshopify.com/";
    process.env.SHOPIFY_ADMIN_ACCESS_TOKEN = "shpat_admin";
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(productPayload("Old"))
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

    await expect(pushShopifyProductTitle("9", { en: "New" })).resolves.toEqual({
      ok: true,
      skipped: false,
      warnings: [],
    });
    const updateBody = JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body));
    expect(updateBody.variables.product).toEqual({
      id: "gid://shopify/Product/9",
      title: "New",
    });
  });

  it("registers PT/ES translations when they differ", async () => {
    useAdminToken();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(productPayload("Hat EN"))
      .mockResolvedValueOnce(i18nPayload({ pt: "Chapéu", es: null }))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { translationsRegister: { translations: [{ key: "title", locale: "es" }], userErrors: [] } },
        }),
      });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      pushShopifyProductTitle("1", { en: "Hat EN", ptBR: "Chapéu", es: "Sombrero" }),
    ).resolves.toEqual({ ok: true, skipped: false, warnings: [] });
    const registerBody = JSON.parse(String(fetchMock.mock.calls[2]?.[1]?.body));
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

  it("still writes EN and warns when the translations scopes are missing", async () => {
    useAdminToken();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(productPayload("Old EN"))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { productUpdate: { product: { id: "gid://shopify/Product/1", title: "Hat EN" }, userErrors: [] } },
        }),
      })
      .mockResolvedValueOnce(
        accessDenied("Access denied for translatableResource field. Required access: `read_translations` access scope."),
      );
    vi.stubGlobal("fetch", fetchMock);

    const result = await pushShopifyProductTitle("1", { en: "Hat EN", ptBR: "Chapéu" });
    expect(result).toMatchObject({ ok: true, skipped: false });
    expect(result).toHaveProperty("warnings");
    expect((result as { warnings: string[] }).warnings[0]).toMatch(/read_translations/);
  });

  it("reports the Shopify message when productUpdate is denied", async () => {
    useAdminToken();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(productPayload("Old"))
      .mockResolvedValueOnce(
        accessDenied("Access denied for productUpdate field. Required access: `write_products` access scope."),
      );
    vi.stubGlobal("fetch", fetchMock);

    await expect(pushShopifyProductTitle("1", { en: "Hat EN" })).resolves.toEqual({
      ok: false,
      reason: "shopify_error",
      detail: "Access denied for productUpdate field. Required access: `write_products` access scope.",
    });
  });

  it("writes EN when the product read itself is denied", async () => {
    useAdminToken();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(accessDenied("Throttled"))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { productUpdate: { product: { id: "gid://shopify/Product/1", title: "Hat EN" }, userErrors: [] } },
        }),
      });
    vi.stubGlobal("fetch", fetchMock);

    await expect(pushShopifyProductTitle("1", { en: "Hat EN" })).resolves.toEqual({
      ok: true,
      skipped: false,
      warnings: [],
    });
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
      .mockResolvedValueOnce(productPayload("Hat EN"));
    vi.stubGlobal("fetch", fetchMock);

    await expect(pushShopifyProductTitle("1", { en: "Hat EN" })).resolves.toEqual({
      ok: true,
      skipped: true,
      warnings: [],
    });
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("/admin/oauth/access_token");
    expect(fetchMock.mock.calls[1]?.[1]?.headers).toMatchObject({
      "X-Shopify-Access-Token": "oauth-token",
    });
  });
});
