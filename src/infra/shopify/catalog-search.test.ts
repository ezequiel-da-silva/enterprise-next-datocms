import { afterEach, describe, expect, it, vi } from "vitest";
import {
  catalogProductsToHits,
  parseCatalogSearchProducts,
  searchStorefrontProducts,
} from "@/infra/shopify/catalog-search";

describe("parseCatalogSearchProducts", () => {
  it("maps Product nodes and skips empty payloads", () => {
    expect(parseCatalogSearchProducts(null)).toEqual([]);
    expect(
      parseCatalogSearchProducts({
        data: {
          search: {
            nodes: [
              {
                handle: "board",
                title: "Board",
                availableForSale: true,
                featuredImage: null,
                priceRange: { minVariantPrice: { amount: "10.00", currencyCode: "USD" } },
                compareAtPriceRange: { minVariantPrice: null },
              },
              { __typename: "Article" },
            ],
          },
        },
      }),
    ).toEqual([
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

describe("catalogProductsToHits", () => {
  it("builds product SearchHits", () => {
    const products = parseCatalogSearchProducts({
      data: {
        search: {
          nodes: [
            {
              handle: "wax",
              title: "Wax",
              availableForSale: false,
              priceRange: { minVariantPrice: { amount: "5", currencyCode: "BRL" } },
            },
          ],
        },
      },
    });
    expect(catalogProductsToHits(products, "pt")).toEqual([
      {
        id: "wax",
        title: "Wax",
        href: "/pt/products/wax",
        kind: "product",
        product: products[0],
      },
    ]);
  });
});

describe("searchStorefrontProducts", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    delete process.env.SHOPIFY_STORE_DOMAIN;
    delete process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  });

  it("returns [] without Storefront env", async () => {
    await expect(searchStorefrontProducts("board", "en")).resolves.toEqual([]);
  });

  it("returns [] on HTTP failure", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "example.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "token";
    vi.stubGlobal("fetch", vi.fn(async () => new Response("nope", { status: 500 })));
    await expect(searchStorefrontProducts("board", "en")).resolves.toEqual([]);
  });
});
