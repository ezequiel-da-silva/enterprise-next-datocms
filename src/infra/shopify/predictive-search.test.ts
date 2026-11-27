import { afterEach, describe, expect, it, vi } from "vitest";
import {
  mapPredictiveProduct,
  predictiveProductsToHits,
  predictiveSearchProducts,
} from "@/infra/shopify/predictive-search";

describe("mapPredictiveProduct", () => {
  it("maps a valid predictive product node", () => {
    expect(
      mapPredictiveProduct({
        id: "gid://shopify/Product/1",
        handle: "board",
        title: "Board",
        availableForSale: true,
        featuredImage: { url: "https://cdn.shopify.com/a.jpg", altText: "Board", width: 100, height: 100 },
        priceRange: { minVariantPrice: { amount: "199.00", currencyCode: "BRL" } },
        compareAtPriceRange: { minVariantPrice: { amount: "249.00", currencyCode: "BRL" } },
      }),
    ).toEqual({
      handle: "board",
      title: "Board",
      availableForSale: true,
      featuredImage: {
        url: "https://cdn.shopify.com/a.jpg",
        altText: "Board",
        width: 100,
        height: 100,
      },
      hoverImage: null,
      badge: null,
      priceRange: { minVariantPrice: { amount: "199.00", currencyCode: "BRL" } },
      compareAtPrice: { amount: "249.00", currencyCode: "BRL" },
      sizes: [],
    });
  });

  it("marks unavailable products and rejects invalid nodes", () => {
    expect(
      mapPredictiveProduct({
        handle: "wax",
        title: "Wax",
        availableForSale: false,
        priceRange: { minVariantPrice: { amount: "10.00", currencyCode: "USD" } },
      })?.availableForSale,
    ).toBe(false);
    expect(mapPredictiveProduct(null)).toBeNull();
    expect(mapPredictiveProduct({ handle: "x", title: "Y" })).toBeNull();
    expect(mapPredictiveProduct({ handle: "", title: "Y", priceRange: { minVariantPrice: { amount: "1", currencyCode: "USD" } } })).toBeNull();
  });
});

describe("predictiveProductsToHits", () => {
  it("builds product SearchHits with locale hrefs", () => {
    const product = mapPredictiveProduct({
      handle: "board",
      title: "Board",
      availableForSale: true,
      priceRange: { minVariantPrice: { amount: "1", currencyCode: "USD" } },
    });
    expect(product).not.toBeNull();
    expect(predictiveProductsToHits([product!], "pt")).toEqual([
      {
        id: "board",
        title: "Board",
        href: "/pt/products/board",
        kind: "product",
        product,
      },
    ]);
  });
});

describe("predictiveSearchProducts", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    delete process.env.SHOPIFY_STORE_DOMAIN;
    delete process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  });

  it("returns [] when Storefront env is missing", async () => {
    await expect(predictiveSearchProducts("board", "en")).resolves.toEqual([]);
  });

  it("returns [] when the Storefront request fails", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "example.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "token";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("nope", { status: 500 })),
    );
    await expect(predictiveSearchProducts("board", "en")).resolves.toEqual([]);
  });

  it("parses products from a successful predictiveSearch payload", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "example.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "token";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          data: {
            predictiveSearch: {
              products: [
                {
                  id: "gid://shopify/Product/1",
                  handle: "board",
                  title: "Board",
                  availableForSale: true,
                  featuredImage: null,
                  priceRange: { minVariantPrice: { amount: "10.00", currencyCode: "USD" } },
                  compareAtPriceRange: { minVariantPrice: null },
                },
              ],
            },
          },
        }),
      ),
    );

    await expect(predictiveSearchProducts("bo", "en")).resolves.toEqual([
      {
        handle: "board",
        title: "Board",
        availableForSale: true,
        featuredImage: null,
        hoverImage: null,
        badge: null,
        priceRange: { minVariantPrice: { amount: "10.00", currencyCode: "USD" } },
        compareAtPrice: null,
        sizes: [],
      },
    ]);
  });
});
