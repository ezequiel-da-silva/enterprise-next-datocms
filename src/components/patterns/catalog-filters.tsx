import {
  FacetPanel,
  type CatalogFacetOption,
  type CatalogStockOption,
} from "@/components/patterns/catalog-facet-panel";
import { CatalogFiltersDrawer } from "@/components/patterns/catalog-filters-drawer";
import { CatalogSortSelect } from "@/components/patterns/catalog-sort-select";
import type { AppLocale } from "@/constants/i18n";
import type { StorefrontCollectionProduct } from "@/infra/shopify/storefront";
import {
  CATALOG_PROFILE_VALUES,
  CATALOG_TERRAIN_VALUES,
  catalogFacetsActive,
  catalogHref,
  countCatalogFacetOptions,
  type CatalogFilters as CatalogFiltersState,
} from "@/lib/catalog/catalog-filters";
import {
  resolveCatalogResultsLabel,
  type CatalogFiltersCopy,
} from "@/lib/i18n/catalog-filters-copy";
import { snowboardEnumLabel } from "@/lib/i18n/pdp-copy";
import Link from "next/link";
import type { ReactNode } from "react";

const CHIP =
  "touch-target inline-flex shrink-0 items-center justify-center rounded-lg border px-3 text-sm font-medium whitespace-nowrap transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const CHIP_ACTIVE = "border-foreground bg-foreground text-background";

type CatalogFiltersProps = {
  locale: AppLocale;
  pathname: string;
  filters: CatalogFiltersState;
  /** Pre-filter catalog used for facet option counts. */
  catalog: readonly StorefrontCollectionProduct[];
  resultCount: number;
  copy: CatalogFiltersCopy;
  children: ReactNode;
};

function buildFacetOptions(
  locale: AppLocale,
  pathname: string,
  filters: CatalogFiltersState,
  catalog: readonly StorefrontCollectionProduct[],
  copy: CatalogFiltersCopy,
): {
  terrainOptions: CatalogFacetOption[];
  profileOptions: CatalogFacetOption[];
  stock: CatalogStockOption;
  activeFacetCount: number;
} {
  const counts = countCatalogFacetOptions(catalog, filters);

  const terrainOptions = CATALOG_TERRAIN_VALUES.filter(
    (value) => counts.terrain[value] > 0 || filters.terrain === value,
  ).map((value) => ({
    href: catalogHref(pathname, filters, {
      terrain: filters.terrain === value ? null : value,
    }),
    label: snowboardEnumLabel(locale, "terrain", value) ?? value,
    count: counts.terrain[value],
    active: filters.terrain === value,
  }));

  const profileOptions = CATALOG_PROFILE_VALUES.filter(
    (value) => counts.profile[value] > 0 || filters.profile === value,
  ).map((value) => ({
    href: catalogHref(pathname, filters, {
      profile: filters.profile === value ? null : value,
    }),
    label: snowboardEnumLabel(locale, "profile", value) ?? value,
    count: counts.profile[value],
    active: filters.profile === value,
  }));

  const stock: CatalogStockOption = {
    href: catalogHref(pathname, filters, { inStock: !filters.inStock }),
    label: copy.inStockOnly,
    active: filters.inStock,
  };

  let activeFacetCount = 0;
  if (filters.terrain) activeFacetCount += 1;
  if (filters.profile) activeFacetCount += 1;
  if (filters.inStock) activeFacetCount += 1;

  return { terrainOptions, profileOptions, stock, activeFacetCount };
}

export function CatalogFilters({
  locale,
  pathname,
  filters,
  catalog,
  resultCount,
  copy,
  children,
}: CatalogFiltersProps) {
  const facetsOn = catalogFacetsActive(filters);
  const resultsLabel = resolveCatalogResultsLabel(copy.resultsTemplate, resultCount);
  const { terrainOptions, profileOptions, stock, activeFacetCount } = buildFacetOptions(
    locale,
    pathname,
    filters,
    catalog,
    copy,
  );
  const clearFacetsHref = catalogHref(pathname, filters, {
    terrain: null,
    profile: null,
    inStock: false,
  });

  const activeChips: { key: string; label: string; href: string }[] = [];
  if (filters.terrain) {
    activeChips.push({
      key: "terrain",
      label: snowboardEnumLabel(locale, "terrain", filters.terrain) ?? filters.terrain,
      href: catalogHref(pathname, filters, { terrain: null }),
    });
  }
  if (filters.profile) {
    activeChips.push({
      key: "profile",
      label: snowboardEnumLabel(locale, "profile", filters.profile) ?? filters.profile,
      href: catalogHref(pathname, filters, { profile: null }),
    });
  }
  if (filters.inStock) {
    activeChips.push({
      key: "inStock",
      label: copy.inStockOnly,
      href: catalogHref(pathname, filters, { inStock: false }),
    });
  }

  const panel = (
    <FacetPanel
      terrainLabel={copy.terrainLabel}
      profileLabel={copy.profileLabel}
      terrainOptions={terrainOptions}
      profileOptions={profileOptions}
      stock={stock}
    />
  );

  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[15rem_1fr] lg:gap-10">
      <aside
        className="hidden lg:sticky lg:top-24 lg:block lg:self-start"
        aria-label={copy.filtersLabel}
      >
        <h2 className="type-body m-0 font-semibold text-foreground">{copy.filtersLabel}</h2>
        {panel}
      </aside>

      <div className="min-w-0 space-y-4">
        <div className="sticky top-18 z-30 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-sm lg:static lg:mx-0 lg:border-b-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
          <p className="type-body m-0 text-muted-foreground">{resultsLabel}</p>
          <div className="flex flex-wrap items-center gap-3">
            <CatalogFiltersDrawer
              filtersLabel={copy.filtersLabel}
              openFiltersLabel={copy.openFiltersLabel}
              closeFiltersLabel={copy.closeFiltersLabel}
              terrainLabel={copy.terrainLabel}
              profileLabel={copy.profileLabel}
              terrainOptions={terrainOptions}
              profileOptions={profileOptions}
              stock={stock}
              activeFacetCount={activeFacetCount}
            />
            <CatalogSortSelect pathname={pathname} filters={filters} copy={copy} />
          </div>
        </div>

        {facetsOn ? (
          <div
            className="flex flex-wrap items-center gap-2"
            role="group"
            aria-label={copy.activeFiltersLabel}
          >
            {activeChips.map((chip) => (
              <Link
                key={chip.key}
                href={chip.href}
                scroll={false}
                className={[CHIP, CHIP_ACTIVE].join(" ")}
                aria-label={`${chip.label} ×`}
              >
                <span aria-hidden>{chip.label}</span>
                <span className="ml-1.5" aria-hidden>
                  ×
                </span>
              </Link>
            ))}
            <Link
              href={clearFacetsHref}
              scroll={false}
              className="touch-target-text text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              {copy.clearFilters}
            </Link>
          </div>
        ) : null}

        {children}
      </div>
    </div>
  );
}
