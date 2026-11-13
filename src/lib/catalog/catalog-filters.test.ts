import { describe, expect, it } from "vitest";
import type { StorefrontCollectionProduct } from "@/infra/shopify/storefront";
import {
  catalogFacetsActive,
  catalogFiltersActive,
  catalogHref,
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
    ...partial,
  };
}

const base: CatalogFilters = {
  terrain: null,
  profile: null,
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
        inStock: "1",
        sort: "price_asc",
      }),
    ).toEqual({
      terrain: "freeride",
      profile: "camber",
      inStock: true,
      sort: "price_asc",
    });
  });

  it("ignores unknown values and uses the first array entry", () => {
    expect(
      parseCatalogSearchParams({
        terrain: "banana",
        profile: ["hybrid", "camber"],
        inStock: "true",
        sort: "cheap",
      }),
    ).toEqual({
      terrain: null,
      profile: "hybrid",
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
      inStock: true,
      sort: "price_desc",
    };
    expect(catalogHref("/pt/shop", current, { sort: "relevance", profile: "camber" })).toBe(
      "/pt/shop?terrain=freestyle&profile=camber&inStock=1",
    );
  });
});
