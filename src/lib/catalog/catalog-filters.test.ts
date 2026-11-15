import { describe, expect, it } from "vitest";
import type { StorefrontCollectionProduct } from "@/infra/shopify/storefront";
import { extractCatalogSizesFromOptions } from "@/lib/shopify/catalog-size-options";
import {
  catalogFacetsActive,
  catalogFiltersActive,
  catalogHref,
  catalogPriceBandBounds,
  productInPriceBand,
  countCatalogFacetOptions,
  filterAndSortCatalogProducts,
  parseCatalogSearchParams,
  type CatalogFilters,
} from "@/lib/catalog/catalog-filters";

function product(
  partial: Partial<StorefrontCollectionProduct> & Pick<StorefrontCollectionProduct, "handle">,
): StorefrontCollectionProduct {
  return {
    title: partial.handle,
    availableForSale: true,
    featuredImage: null,
    hoverImage: null,
    badge: null,
    profile: null,
    terrain: null,
    flex: null,
    priceRange: { minVariantPrice: { amount: "100", currencyCode: "USD" } },
    compareAtPrice: null,
    sizes: [],
    ...partial,
  };
}

const base: CatalogFilters = {
  terrain: null,
  profile: null,
  size: null,
  price: null,
  inStock: false,
  sort: "relevance",
};

describe("parseCatalogSearchParams", () => {
  it("returns defaults for empty or missing params", () => {
    expect(parseCatalogSearchParams(undefined)).toEqual(base);
    expect(parseCatalogSearchParams({})).toEqual(base);
  });

  it("accepts closed vocabularies and inStock=1", () => {
    expect(
      parseCatalogSearchParams({
        terrain: "freeride",
        profile: "camber",
        size: "156cm",
        price: "500-1000",
        inStock: "1",
        sort: "price_asc",
      }),
    ).toEqual({
      terrain: "freeride",
      profile: "camber",
      size: "156",
      price: "500-1000",
      inStock: true,
      sort: "price_asc",
    });
  });

  it("ignores unknown values and uses the first array entry", () => {
    expect(
      parseCatalogSearchParams({
        terrain: "banana",
        profile: ["hybrid", "camber"],
        size: "XL",
        price: "0-999",
        inStock: "true",
        sort: "cheap",
      }),
    ).toEqual({
      terrain: null,
      profile: "hybrid",
      size: null,
      price: null,
      inStock: false,
      sort: "relevance",
    });
  });
});

describe("catalogFacetsActive", () => {
  it("ignores sort and tracks facets only", () => {
    expect(catalogFacetsActive(base)).toBe(false);
    expect(catalogFacetsActive({ ...base, sort: "price_desc" })).toBe(false);
    expect(catalogFacetsActive({ ...base, terrain: "powder" })).toBe(true);
    expect(catalogFacetsActive({ ...base, inStock: true })).toBe(true);
    expect(catalogFacetsActive({ ...base, size: "156" })).toBe(true);
    expect(catalogFacetsActive({ ...base, price: "0-200" })).toBe(true);
  });
});

describe("catalogFiltersActive", () => {
  it("is false only for the default state", () => {
    expect(catalogFiltersActive(base)).toBe(false);
    expect(catalogFiltersActive({ ...base, terrain: "powder" })).toBe(true);
    expect(catalogFiltersActive({ ...base, inStock: true })).toBe(true);
    expect(catalogFiltersActive({ ...base, sort: "price_desc" })).toBe(true);
  });
});

describe("countCatalogFacetOptions", () => {
  const catalog = [
    product({
      handle: "a",
      terrain: "all_mountain",
      profile: "camber",
      availableForSale: true,
    }),
    product({
      handle: "b",
      terrain: "powder",
      profile: "rocker",
      availableForSale: false,
    }),
    product({
      handle: "c",
      terrain: "all_mountain",
      profile: "camber",
      availableForSale: true,
    }),
    product({
      handle: "d",
      terrain: "freestyle",
      profile: null,
      availableForSale: true,
    }),
  ];

  it("counts terrain respecting profile and stock, ignoring current terrain", () => {
    const counts = countCatalogFacetOptions(catalog, {
      ...base,
      terrain: "powder",
      profile: "camber",
    });
    expect(counts.terrain.all_mountain).toBe(2);
    expect(counts.terrain.powder).toBe(0);
    expect(counts.terrain.freestyle).toBe(0);
    // Profile counts respect current terrain=powder (only product b).
    expect(counts.profile.camber).toBe(0);
    expect(counts.profile.rocker).toBe(1);
  });

  it("respects inStock when counting and leaves zeros for empty options", () => {
    const counts = countCatalogFacetOptions(catalog, { ...base, inStock: true });
    expect(counts.terrain.all_mountain).toBe(2);
    expect(counts.terrain.powder).toBe(0);
    expect(counts.terrain.freestyle).toBe(1);
    expect(counts.profile.camber).toBe(2);
    expect(counts.profile.rocker).toBe(0);
    expect(counts.profile.hybrid).toBe(0);
  });
});

describe("filterAndSortCatalogProducts", () => {
  const catalog = [
    product({
      handle: "a",
      terrain: "all_mountain",
      profile: "camber",
      availableForSale: true,
      priceRange: { minVariantPrice: { amount: "300", currencyCode: "USD" } },
    }),
    product({
      handle: "b",
      terrain: "powder",
      profile: "rocker",
      availableForSale: false,
      priceRange: { minVariantPrice: { amount: "100", currencyCode: "USD" } },
    }),
    product({
      handle: "c",
      terrain: "all_mountain",
      profile: null,
      availableForSale: true,
      priceRange: { minVariantPrice: { amount: "200", currencyCode: "USD" } },
    }),
  ];

  it("skips products missing the selected terrain or profile", () => {
    expect(
      filterAndSortCatalogProducts(catalog, { ...base, terrain: "all_mountain" }).map((p) => p.handle),
    ).toEqual(["a", "c"]);
    expect(
      filterAndSortCatalogProducts(catalog, { ...base, profile: "camber" }).map((p) => p.handle),
    ).toEqual(["a"]);
  });

  it("filters in-stock and sorts by price", () => {
    expect(
      filterAndSortCatalogProducts(catalog, { ...base, inStock: true, sort: "price_asc" }).map(
        (p) => p.handle,
      ),
    ).toEqual(["c", "a"]);
    expect(
      filterAndSortCatalogProducts(catalog, { ...base, sort: "price_desc" }).map((p) => p.handle),
    ).toEqual(["a", "c", "b"]);
  });

  it("keeps relevance order when sort is default", () => {
    expect(filterAndSortCatalogProducts(catalog, base).map((p) => p.handle)).toEqual(["a", "b", "c"]);
  });
});

describe("catalogHref", () => {
  it("merges patches and omits default params", () => {
    expect(catalogHref("/pt/shop", base, { terrain: "powder" })).toBe("/pt/shop?terrain=powder");
    expect(
      catalogHref("/pt/shop", { ...base, terrain: "powder", sort: "price_asc" }, { terrain: null }),
    ).toBe("/pt/shop?sort=price_asc");
    expect(
      catalogHref("/en/collections/boards", { ...base, inStock: true }, { inStock: false }),
    ).toBe("/en/collections/boards");
  });

  it("toggles facets and sort together", () => {
    const current: CatalogFilters = {
      terrain: "freestyle",
      profile: "flat",
      size: null,
      price: null,
      inStock: true,
      sort: "price_desc",
    };
    expect(catalogHref("/pt/shop", current, { sort: "relevance", profile: "camber" })).toBe(
      "/pt/shop?terrain=freestyle&profile=camber&inStock=1",
    );
  });
});

describe("size facet (Title extractor)", () => {
  /** Mirrors the Storefront mapper: sizes come from variant `selectedOptions`. */
  function boardWithTitleSizes(handle: string, titles: string[]): StorefrontCollectionProduct {
    return product({
      handle,
      sizes: extractCatalogSizesFromOptions(titles.map((value) => [{ name: "Title", value }])),
    });
  }

  const catalog = [
    boardWithTitleSizes("a", ["152", "156 cm"]),
    boardWithTitleSizes("b", ["156", "159"]),
    boardWithTitleSizes("c", ["Default Title"]),
    boardWithTitleSizes("d", ["Red"]),
  ];

  it("derives numeric board lengths from Title and ignores Default Title / colors", () => {
    expect(catalog.map((p) => p.sizes)).toEqual([["152", "156"], ["156", "159"], [], []]);
  });

  it("filters by size and drops products without sizes", () => {
    expect(filterAndSortCatalogProducts(catalog, { ...base, size: "156" }).map((p) => p.handle)).toEqual([
      "a",
      "b",
    ]);
    expect(filterAndSortCatalogProducts(catalog, { ...base, size: "152" }).map((p) => p.handle)).toEqual(["a"]);
    expect(filterAndSortCatalogProducts(catalog, { ...base, size: "170" })).toEqual([]);
  });

  it("counts sizes ignoring the size facet itself but honoring other facets", () => {
    const counts = countCatalogFacetOptions(catalog, base);
    expect(counts.size).toMatchObject({ "152": 1, "156": 2, "159": 1 });
    expect(Object.keys(counts.size)).toHaveLength(3);

    const stocked = countCatalogFacetOptions(
      [
        product({ handle: "x", sizes: ["152"], availableForSale: false }),
        product({ handle: "y", sizes: ["152", "156"], availableForSale: true }),
      ],
      { ...base, inStock: true },
    );
    expect(stocked.size["152"]).toBe(1);
    expect(stocked.size["156"]).toBe(1);

    const crossed = countCatalogFacetOptions(catalog, { ...base, size: "152", price: "0-200" });
    expect(crossed.size["156"]).toBe(2);
  });

  it("keeps sizes visible with zero count when other facets exclude them", () => {
    const counts = countCatalogFacetOptions(
      [product({ handle: "z", sizes: ["160"], terrain: "powder" })],
      { ...base, terrain: "freestyle" },
    );
    expect(counts.size["160"]).toBe(0);
  });

  it("round-trips size in hrefs", () => {
    expect(catalogHref("/pt/shop", base, { size: "156" })).toBe("/pt/shop?size=156");
    expect(catalogHref("/pt/shop", { ...base, size: "156" }, { size: null })).toBe("/pt/shop");
  });
});

describe("price band facet", () => {
  const usd = (handle: string, amount: string) =>
    product({ handle, priceRange: { minVariantPrice: { amount, currencyCode: "USD" } } });
  const brl = (handle: string, amount: string) =>
    product({ handle, priceRange: { minVariantPrice: { amount, currencyCode: "BRL" } } });

  it("uses the base scale for USD and ×5 for BRL", () => {
    expect(catalogPriceBandBounds("200-500", "USD")).toEqual({ min: 200, max: 500 });
    expect(catalogPriceBandBounds("200-500", "BRL")).toEqual({ min: 1000, max: 2500 });
    expect(catalogPriceBandBounds("1000-", "BRL")).toEqual({ min: 5000, max: null });
  });

  it("treats min as inclusive and max as exclusive", () => {
    expect(productInPriceBand(usd("a", "200"), "200-500")).toBe(true);
    expect(productInPriceBand(usd("a", "200"), "0-200")).toBe(false);
    expect(productInPriceBand(usd("a", "199.99"), "0-200")).toBe(true);
    expect(productInPriceBand(usd("a", "1000"), "1000-")).toBe(true);
    expect(productInPriceBand(usd("a", "not-a-number"), "0-200")).toBe(false);
  });

  it("filters BRL products with scaled bands", () => {
    const catalog = [brl("cheap", "900"), brl("mid", "1800"), brl("high", "3200"), brl("top", "6000")];
    expect(filterAndSortCatalogProducts(catalog, { ...base, price: "0-200" }).map((p) => p.handle)).toEqual([
      "cheap",
    ]);
    expect(filterAndSortCatalogProducts(catalog, { ...base, price: "200-500" }).map((p) => p.handle)).toEqual([
      "mid",
    ]);
    expect(filterAndSortCatalogProducts(catalog, { ...base, price: "500-1000" }).map((p) => p.handle)).toEqual([
      "high",
    ]);
    expect(filterAndSortCatalogProducts(catalog, { ...base, price: "1000-" }).map((p) => p.handle)).toEqual([
      "top",
    ]);
  });

  it("counts bands ignoring the price facet but honoring terrain", () => {
    const catalog = [
      product({ handle: "a", terrain: "powder", priceRange: { minVariantPrice: { amount: "100", currencyCode: "USD" } } }),
      product({ handle: "b", terrain: "powder", priceRange: { minVariantPrice: { amount: "300", currencyCode: "USD" } } }),
      product({ handle: "c", terrain: "freestyle", priceRange: { minVariantPrice: { amount: "300", currencyCode: "USD" } } }),
    ];
    const counts = countCatalogFacetOptions(catalog, { ...base, terrain: "powder", price: "0-200" });
    expect(counts.price).toEqual({ "0-200": 1, "200-500": 1, "500-1000": 0, "1000-": 0 });
  });

  it("round-trips price in hrefs and keeps the param order stable", () => {
    expect(catalogHref("/pt/shop", { ...base, size: "156", inStock: true }, { price: "1000-" })).toBe(
      "/pt/shop?size=156&price=1000-&inStock=1",
    );
  });
});
