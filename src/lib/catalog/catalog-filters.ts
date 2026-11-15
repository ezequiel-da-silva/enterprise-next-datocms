import type { StorefrontCollectionProduct } from "@/infra/shopify/storefront";
import { normalizeCatalogSizeKey } from "@/lib/shopify/catalog-size-options";

/** Closed terrain vocabulary shared with `product_page.terrain` / PDP labels. */
export const CATALOG_TERRAIN_VALUES = ["all_mountain", "freestyle", "freeride", "powder"] as const;
export type CatalogTerrain = (typeof CATALOG_TERRAIN_VALUES)[number];

/** Closed profile vocabulary shared with `product_page.profile` / PDP labels. */
export const CATALOG_PROFILE_VALUES = ["camber", "rocker", "hybrid", "flat"] as const;
export type CatalogProfile = (typeof CATALOG_PROFILE_VALUES)[number];

export const CATALOG_SORT_VALUES = ["relevance", "price_asc", "price_desc"] as const;
export type CatalogSort = (typeof CATALOG_SORT_VALUES)[number];

/**
 * Price bands as `min-max` (`max` omitted = open ended). Amounts are expressed in the base scale
 * (USD-like); {@link catalogPriceBandScale} converts them to the product currency.
 */
export const CATALOG_PRICE_BAND_VALUES = ["0-200", "200-500", "500-1000", "1000-"] as const;
export type CatalogPriceBand = (typeof CATALOG_PRICE_BAND_VALUES)[number];

const PRICE_BAND_BOUNDS: Record<CatalogPriceBand, { min: number; max: number | null }> = {
  "0-200": { min: 0, max: 200 },
  "200-500": { min: 200, max: 500 },
  "500-1000": { min: 500, max: 1000 },
  "1000-": { min: 1000, max: null },
};

/** BRL storefront prices are roughly 5× the base scale, so the same bands read naturally in R$. */
const BRL_SCALE = 5;

export function catalogPriceBandScale(currencyCode: string): number {
  return currencyCode.trim().toUpperCase() === "BRL" ? BRL_SCALE : 1;
}

/** Band bounds in the given currency: `min` inclusive, `max` exclusive (`null` = no upper limit). */
export function catalogPriceBandBounds(
  band: CatalogPriceBand,
  currencyCode: string,
): { min: number; max: number | null } {
  const scale = catalogPriceBandScale(currencyCode);
  const { min, max } = PRICE_BAND_BOUNDS[band];
  return { min: min * scale, max: max == null ? null : max * scale };
}

export type CatalogFilters = {
  terrain: CatalogTerrain | null;
  profile: CatalogProfile | null;
  /** Normalized board length key (e.g. `"156"`), see `normalizeCatalogSizeKey`. */
  size: string | null;
  price: CatalogPriceBand | null;
  inStock: boolean;
  sort: CatalogSort;
};

export type CatalogFilterPatch = Partial<{
  terrain: CatalogTerrain | null;
  profile: CatalogProfile | null;
  size: string | null;
  price: CatalogPriceBand | null;
  inStock: boolean;
  sort: CatalogSort;
}>;

export type CatalogFacetCounts = {
  terrain: Record<CatalogTerrain, number>;
  profile: Record<CatalogProfile, number>;
  /** Only sizes that appear in the catalog (keys sorted numerically by the consumer). */
  size: Record<string, number>;
  price: Record<CatalogPriceBand, number>;
};

const TERRAIN_SET = new Set<string>(CATALOG_TERRAIN_VALUES);
const PROFILE_SET = new Set<string>(CATALOG_PROFILE_VALUES);
const SORT_SET = new Set<string>(CATALOG_SORT_VALUES);
const PRICE_BAND_SET = new Set<string>(CATALOG_PRICE_BAND_VALUES);

export const DEFAULT_CATALOG_FILTERS: CatalogFilters = {
  terrain: null,
  profile: null,
  size: null,
  price: null,
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

function asSize(raw: string | null): string | null {
  return raw ? normalizeCatalogSizeKey(raw) : null;
}

function asPriceBand(raw: string | null): CatalogPriceBand | null {
  return raw && PRICE_BAND_SET.has(raw) ? (raw as CatalogPriceBand) : null;
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
    size: asSize(firstParam(searchParams.size)),
    price: asPriceBand(firstParam(searchParams.price)),
    inStock: firstParam(searchParams.inStock) === "1",
    sort: asSort(firstParam(searchParams.sort)),
  };
}

/** Facets only (terrain / profile / size / price / stock) — for Clear all and active chips. */
export function catalogFacetsActive(filters: CatalogFilters): boolean {
  return (
    filters.terrain != null ||
    filters.profile != null ||
    filters.size != null ||
    filters.price != null ||
    filters.inStock
  );
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

/** True when the product's lowest price falls inside `band` (currency-scaled, min inclusive / max exclusive). */
export function productInPriceBand(product: StorefrontCollectionProduct, band: CatalogPriceBand): boolean {
  const amount = priceAmount(product);
  if (!Number.isFinite(amount)) return false;
  const { min, max } = catalogPriceBandBounds(band, product.priceRange.minVariantPrice.currencyCode);
  return amount >= min && (max == null || amount < max);
}

type FacetKey = "terrain" | "profile" | "size" | "price";

/** Whether `product` passes stock + every active facet except `skip` (used for cross-filter counts). */
function matchesFacets(
  product: StorefrontCollectionProduct,
  filters: CatalogFilters,
  skip: FacetKey | null,
): boolean {
  if (filters.inStock && !product.availableForSale) return false;
  if (skip !== "terrain" && filters.terrain && product.terrain !== filters.terrain) return false;
  if (skip !== "profile" && filters.profile && product.profile !== filters.profile) return false;
  if (skip !== "size" && filters.size && !product.sizes.includes(filters.size)) return false;
  if (skip !== "price" && filters.price && !productInPriceBand(product, filters.price)) return false;
  return true;
}

/**
 * Filter by terrain/profile/size/price/stock, then sort.
 * Products missing the selected terrain/profile/size are skipped when that facet is set.
 */
export function filterAndSortCatalogProducts(
  products: readonly StorefrontCollectionProduct[],
  filters: CatalogFilters,
): StorefrontCollectionProduct[] {
  let list = products.filter((product) => matchesFacets(product, filters, null));

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
  const size: Record<string, number> = {};
  const price = Object.fromEntries(CATALOG_PRICE_BAND_VALUES.map((v) => [v, 0])) as Record<
    CatalogPriceBand,
    number
  >;

  for (const product of products) {
    if (matchesFacets(product, filters, "terrain") && product.terrain && TERRAIN_SET.has(product.terrain)) {
      terrain[product.terrain as CatalogTerrain] += 1;
    }
    if (matchesFacets(product, filters, "profile") && product.profile && PROFILE_SET.has(product.profile)) {
      profile[product.profile as CatalogProfile] += 1;
    }
    if (matchesFacets(product, filters, "size")) {
      for (const key of new Set(product.sizes)) size[key] = (size[key] ?? 0) + 1;
    } else {
      // Keep the key visible (count 0) so a selected / cross-filtered size does not vanish.
      for (const key of new Set(product.sizes)) size[key] ??= 0;
    }
    if (matchesFacets(product, filters, "price")) {
      for (const band of CATALOG_PRICE_BAND_VALUES) {
        if (productInPriceBand(product, band)) price[band] += 1;
      }
    }
  }

  return { terrain, profile, size, price };
}

function writeParams(filters: CatalogFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.terrain) params.set("terrain", filters.terrain);
  if (filters.profile) params.set("profile", filters.profile);
  if (filters.size) params.set("size", filters.size);
  if (filters.price) params.set("price", filters.price);
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
    size: patch.size !== undefined ? patch.size : current.size,
    price: patch.price !== undefined ? patch.price : current.price,
    inStock: patch.inStock !== undefined ? patch.inStock : current.inStock,
    sort: patch.sort !== undefined ? patch.sort : current.sort,
  };
  const qs = writeParams(next).toString();
  const base = pathname.trim() || "/";
  return qs ? `${base}?${qs}` : base;
}
