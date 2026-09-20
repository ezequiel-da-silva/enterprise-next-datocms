import { describe, expect, it, vi } from "vitest";
import { getStorefrontCollectionByHandle, getStorefrontCollectionMeta, getStorefrontProductByHandle, storefrontAuthHeaders } from "@/infra/shopify/storefront";

describe("getStorefrontProductByHandle", () => {
  it("returns null when env is missing", async () => {
    delete process.env.SHOPIFY_STORE_DOMAIN;
    delete process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
    await expect(getStorefrontProductByHandle("hat", "en")).resolves.toBeNull();
  });

  it("maps a product payload from Storefront GraphQL", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "shop.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "token";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          product: {
            id: "gid://shopify/Product/1",
            title: "Hat",
            handle: "hat",
            availableForSale: true,
            featuredImage: { url: "https://cdn.shopify.com/hat.jpg", altText: "Hat", width: 800, height: 800 },
            priceRange: { minVariantPrice: { amount: "19.00", currencyCode: "BRL" } },
            variants: {
              nodes: [
                {
                  id: "gid://shopify/ProductVariant/2",
                  title: "Default",
                  availableForSale: true,
                  quantityAvailable: 3,
                  price: { amount: "19.00", currencyCode: "BRL" },
                },
              ],
            },
          },
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const product = await getStorefrontProductByHandle("hat", "pt");
    expect(product?.handle).toBe("hat");
    expect(product?.priceRange.minVariantPrice.currencyCode).toBe("BRL");
    expect(product?.variants).toHaveLength(1);
    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)) as {
      variables: { country: string };
    };
    expect(body.variables.country).toBe("BR");
    expect(fetchMock.mock.calls[0]?.[1]?.headers).toMatchObject({
      "X-Shopify-Storefront-Access-Token": "token",
    });
    vi.unstubAllGlobals();
  });

  it("maps a collection payload from Storefront GraphQL", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "shop.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "token";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          collection: {
            id: "gid://shopify/Collection/1",
            title: "Hydrogen",
            handle: "hydrogen",
            image: null,
            products: {
              nodes: [
                {
                  title: "Hat",
                  handle: "hat",
                  availableForSale: true,
                  featuredImage: null,
                  priceRange: { minVariantPrice: { amount: "19.00", currencyCode: "BRL" } },
                },
              ],
            },
          },
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const collection = await getStorefrontCollectionByHandle("hydrogen", "es");
    expect(collection?.handle).toBe("hydrogen");
    expect(collection?.products).toHaveLength(1);
    expect(collection?.products[0]?.handle).toBe("hat");
    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)) as {
      variables: { country: string };
    };
    expect(body.variables.country).toBe("ES");
    vi.unstubAllGlobals();
  });

  it("fetches collection meta without product nodes", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "shop.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "token";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          collection: {
            title: "Hydrogen",
            handle: "hydrogen",
            image: { url: "https://cdn.shopify.com/col.jpg", altText: "Col", width: 400, height: 300 },
          },
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const meta = await getStorefrontCollectionMeta("hydrogen", "en");
    expect(meta).toEqual({
      handle: "hydrogen",
      title: "Hydrogen",
      image: { url: "https://cdn.shopify.com/col.jpg", altText: "Col", width: 400, height: 300 },
    });
    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)) as { query: string };
    expect(body.query).not.toContain("products(");
    vi.unstubAllGlobals();
  });

  it("sends the private Headless header for shpat_ tokens", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "shop.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "shpat_test";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { product: null } }),
    });
    vi.stubGlobal("fetch", fetchMock);
    await getStorefrontProductByHandle("hat", "en");
    expect(fetchMock.mock.calls[0]?.[1]?.headers).toMatchObject({
      "Shopify-Storefront-Private-Token": "shpat_test",
    });
    vi.unstubAllGlobals();
  });

  it("maps public vs private Storefront headers", () => {
    expect(storefrontAuthHeaders("abc123")).toEqual({
      "X-Shopify-Storefront-Access-Token": "abc123",
    });
    expect(storefrontAuthHeaders("shpat_secret")).toEqual({
      "Shopify-Storefront-Private-Token": "shpat_secret",
    });
  });
});
