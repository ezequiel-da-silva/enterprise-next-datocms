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
  type CatalogProfile,
  type CatalogTerrain,
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
const CHIP_IDLE = "border-border bg-background text-foreground hover:border-foreground/40";
const CHIP_ACTIVE = "border-foreground bg-foreground text-background";
const CHIP_MUTED = "border-border/60 bg-background text-muted-foreground hover:border-foreground/30";

const DESKTOP_LINK =
  "block border-l-2 py-1 pl-3 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const DESKTOP_IDLE = "border-transparent text-foreground hover:border-foreground/30 hover:underline";
const DESKTOP_ACTIVE = "border-foreground font-semibold text-foreground underline underline-offset-4";
const DESKTOP_MUTED = "border-transparent text-muted-foreground hover:underline";

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

function FacetChip({
  href,
  active,
  muted,
  children,
}: {
  href: string;
  active: boolean;
  muted?: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      className={[CHIP, active ? CHIP_ACTIVE : muted ? CHIP_MUTED : CHIP_IDLE].join(" ")}
      aria-current={active ? "true" : undefined}
    >
      {children}
    </Link>
  );
}

function DesktopFacetLink({
  href,
  active,
  muted,
  children,
}: {
  href: string;
  active: boolean;
  muted?: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      className={[DESKTOP_LINK, active ? DESKTOP_ACTIVE : muted ? DESKTOP_MUTED : DESKTOP_IDLE].join(
        " ",
      )}
      aria-current={active ? "true" : undefined}
    >
      {children}
    </Link>
  );
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
  const counts = countCatalogFacetOptions(catalog, filters);
  const resultsLabel = resolveCatalogResultsLabel(copy.resultsTemplate, resultCount);
  const clearFacetsHref = catalogHref(pathname, filters, {
    terrain: null,
    profile: null,
    inStock: false,
  });

  const terrainLabel = (value: CatalogTerrain) => {
    const name = snowboardEnumLabel(locale, "terrain", value) ?? value;
    return `${name} (${counts.terrain[value]})`;
  };

  const profileLabel = (value: CatalogProfile) => {
    const name = snowboardEnumLabel(locale, "profile", value) ?? value;
    return `${name} (${counts.profile[value]})`;
  };

  const terrainHref = (value: CatalogTerrain) =>
    catalogHref(pathname, filters, {
      terrain: filters.terrain === value ? null : value,
    });

  const profileHref = (value: CatalogProfile) =>
    catalogHref(pathname, filters, {
      profile: filters.profile === value ? null : value,
    });

  const stockHref = catalogHref(pathname, filters, { inStock: !filters.inStock });

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

  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[14rem_1fr] lg:gap-10">
      <aside className="lg:sticky lg:top-24 lg:self-start" aria-label={`${copy.terrainLabel}, ${copy.profileLabel}`}>
        {/* Mobile: horizontal chip row */}
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:hidden">
          {CATALOG_TERRAIN_VALUES.map((value) => (
            <FacetChip
              key={value}
              href={terrainHref(value)}
              active={filters.terrain === value}
              muted={counts.terrain[value] === 0 && filters.terrain !== value}
            >
              {terrainLabel(value)}
            </FacetChip>
          ))}
          {CATALOG_PROFILE_VALUES.map((value) => (
            <FacetChip
              key={value}
              href={profileHref(value)}
              active={filters.profile === value}
              muted={counts.profile[value] === 0 && filters.profile !== value}
            >
              {profileLabel(value)}
            </FacetChip>
          ))}
          <FacetChip href={stockHref} active={filters.inStock}>
            {copy.inStockOnly}
          </FacetChip>
        </div>

        {/* Desktop: compact text links */}
        <nav className="hidden space-y-6 lg:block">
          <fieldset className="m-0 min-w-0 border-0 p-0">
            <legend className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {copy.terrainLabel}
            </legend>
            <div className="flex flex-col gap-0.5">
              {CATALOG_TERRAIN_VALUES.map((value) => (
                <DesktopFacetLink
                  key={value}
                  href={terrainHref(value)}
                  active={filters.terrain === value}
                  muted={counts.terrain[value] === 0 && filters.terrain !== value}
                >
                  {terrainLabel(value)}
                </DesktopFacetLink>
              ))}
            </div>
          </fieldset>
          <fieldset className="m-0 min-w-0 border-0 p-0">
            <legend className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {copy.profileLabel}
            </legend>
            <div className="flex flex-col gap-0.5">
              {CATALOG_PROFILE_VALUES.map((value) => (
                <DesktopFacetLink
                  key={value}
                  href={profileHref(value)}
                  active={filters.profile === value}
                  muted={counts.profile[value] === 0 && filters.profile !== value}
                >
                  {profileLabel(value)}
                </DesktopFacetLink>
              ))}
            </div>
          </fieldset>
          <Link
            href={stockHref}
            scroll={false}
            className="flex items-center gap-2 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            aria-current={filters.inStock ? "true" : undefined}
          >
            <span
              className={[
                "inline-flex size-4 shrink-0 items-center justify-center rounded border",
                filters.inStock
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background",
              ].join(" ")}
              aria-hidden
            >
              {filters.inStock ? "✓" : null}
            </span>
            {copy.inStockOnly}
          </Link>
        </nav>
      </aside>

      <div className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="type-body m-0 text-muted-foreground">{resultsLabel}</p>
          <CatalogSortSelect pathname={pathname} filters={filters} copy={copy} />
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
