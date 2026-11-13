import type { StorefrontCollectionProduct } from "@/infra/shopify/storefront";

/** Closed terrain vocabulary shared with `product_page.terrain` / PDP labels. */
export const CATALOG_TERRAIN_VALUES = ["all_mountain", "freestyle", "freeride", "powder"] as const;
export type CatalogTerrain = (typeof CATALOG_TERRAIN_VALUES)[number];

/** Closed profile vocabulary shared with `product_page.profile` / PDP labels. */
export const CATALOG_PROFILE_VALUES = ["camber", "rocker", "hybrid", "flat"] as const;
export type CatalogProfile = (typeof CATALOG_PROFILE_VALUES)[number];

export const CATALOG_SORT_VALUES = ["relevance", "price_asc", "price_desc"] as const;
export type CatalogSort = (typeof CATALOG_SORT_VALUES)[number];

export type CatalogFilters = {
  terrain: CatalogTerrain | null;
  profile: CatalogProfile | null;
  inStock: boolean;
  sort: CatalogSort;
};

export type CatalogFilterPatch = Partial<{
  terrain: CatalogTerrain | null;
  profile: CatalogProfile | null;
  inStock: boolean;
  sort: CatalogSort;
}>;

export type CatalogFacetCounts = {
  terrain: Record<CatalogTerrain, number>;
  profile: Record<CatalogProfile, number>;
};

const TERRAIN_SET = new Set<string>(CATALOG_TERRAIN_VALUES);
const PROFILE_SET = new Set<string>(CATALOG_PROFILE_VALUES);
const SORT_SET = new Set<string>(CATALOG_SORT_VALUES);

export const DEFAULT_CATALOG_FILTERS: CatalogFilters = {
  terrain: null,
  profile: null,
  inStock: false,
  sort: "relevance",
};

function firstParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === "string" ? first.trim() : null;
  }
  return typeof value === "string" ? value.trim() : null;
}

function asTerrain(raw: string | null): CatalogTerrain | null {
  return raw && TERRAIN_SET.has(raw) ? (raw as CatalogTerrain) : null;
}

function asProfile(raw: string | null): CatalogProfile | null {
  return raw && PROFILE_SET.has(raw) ? (raw as CatalogProfile) : null;
}

function asSort(raw: string | null): CatalogSort {
  return raw && SORT_SET.has(raw) ? (raw as CatalogSort) : "relevance";
}

/** Parse URL search params into a closed catalog filter state (unknown values ignored). */
export function parseCatalogSearchParams(
  searchParams: Readonly<Record<string, string | string[] | undefined>> | null | undefined,
): CatalogFilters {
  if (!searchParams) return { ...DEFAULT_CATALOG_FILTERS };
  return {
    terrain: asTerrain(firstParam(searchParams.terrain)),
    profile: asProfile(firstParam(searchParams.profile)),
    inStock: firstParam(searchParams.inStock) === "1",
    sort: asSort(firstParam(searchParams.sort)),
  };
}

/** Facets only (terrain / profile / stock) — for Clear all and active chips. */
export function catalogFacetsActive(filters: CatalogFilters): boolean {
  return filters.terrain != null || filters.profile != null || filters.inStock;
}

/** True when any non-default filter or sort is active. */
export function catalogFiltersActive(filters: CatalogFilters): boolean {
  return catalogFacetsActive(filters) || filters.sort !== "relevance";
}

function priceAmount(product: StorefrontCollectionProduct): number {
  const raw = product.priceRange.minVariantPrice.amount;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
}

/**
 * Filter by terrain/profile/stock, then sort.
 * Products missing the selected terrain/profile are skipped when that facet is set.
 */
export function filterAndSortCatalogProducts(
  products: readonly StorefrontCollectionProduct[],
  filters: CatalogFilters,
): StorefrontCollectionProduct[] {
  let list = products.filter((product) => {
    if (filters.terrain && product.terrain !== filters.terrain) return false;
    if (filters.profile && product.profile !== filters.profile) return false;
    if (filters.inStock && !product.availableForSale) return false;
    return true;
  });

  if (filters.sort === "price_asc") {
    list = [...list].sort((a, b) => priceAmount(a) - priceAmount(b));
  } else if (filters.sort === "price_desc") {
    list = [...list].sort((a, b) => priceAmount(b) - priceAmount(a));
  }

  return list;
}

/**
 * Counts per facet option against the base catalog, respecting the other active facets
 * (cross-filter) but not the dimension being counted.
 */
export function countCatalogFacetOptions(
  products: readonly StorefrontCollectionProduct[],
  filters: CatalogFilters,
): CatalogFacetCounts {
  const terrain = Object.fromEntries(CATALOG_TERRAIN_VALUES.map((v) => [v, 0])) as Record<
    CatalogTerrain,
    number
  >;
  const profile = Object.fromEntries(CATALOG_PROFILE_VALUES.map((v) => [v, 0])) as Record<
    CatalogProfile,
    number
  >;

  for (const product of products) {
    if (filters.inStock && !product.availableForSale) continue;

    const matchesProfile = !filters.profile || product.profile === filters.profile;
    const matchesTerrain = !filters.terrain || product.terrain === filters.terrain;

    if (matchesProfile && product.terrain && TERRAIN_SET.has(product.terrain)) {
      terrain[product.terrain as CatalogTerrain] += 1;
    }
    if (matchesTerrain && product.profile && PROFILE_SET.has(product.profile)) {
      profile[product.profile as CatalogProfile] += 1;
    }
  }

  return { terrain, profile };
}

function writeParams(filters: CatalogFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.terrain) params.set("terrain", filters.terrain);
  if (filters.profile) params.set("profile", filters.profile);
  if (filters.inStock) params.set("inStock", "1");
  if (filters.sort !== "relevance") params.set("sort", filters.sort);
  return params;
}

/**
 * Merge `patch` onto `current` and build a pathname + query href for `<Link>`.
 * Pass `null` / `false` / `"relevance"` to clear a facet.
 */
export function catalogHref(pathname: string, current: CatalogFilters, patch: CatalogFilterPatch): string {
  const next: CatalogFilters = {
    terrain: patch.terrain !== undefined ? patch.terrain : current.terrain,
    profile: patch.profile !== undefined ? patch.profile : current.profile,
    inStock: patch.inStock !== undefined ? patch.inStock : current.inStock,
    sort: patch.sort !== undefined ? patch.sort : current.sort,
  };
  const qs = writeParams(next).toString();
  const base = pathname.trim() || "/";
  return qs ? `${base}?${qs}` : base;
}
