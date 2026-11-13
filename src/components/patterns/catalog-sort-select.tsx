"use client";

import {
  CATALOG_SORT_VALUES,
  catalogHref,
  type CatalogFilters,
  type CatalogSort,
} from "@/lib/catalog/catalog-filters";
import type { CatalogFiltersCopy } from "@/lib/i18n/catalog-filters-copy";
import { useRouter } from "next/navigation";

type CatalogSortSelectProps = {
  pathname: string;
  filters: CatalogFilters;
  copy: CatalogFiltersCopy;
};

export function CatalogSortSelect({ pathname, filters, copy }: CatalogSortSelectProps) {
  const router = useRouter();
  const labels: Record<CatalogSort, string> = {
    relevance: copy.sortRelevance,
    price_asc: copy.sortPriceAsc,
    price_desc: copy.sortPriceDesc,
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="catalog-sort" className="text-sm font-medium text-foreground">
        {copy.sortLabel}
      </label>
      <div className="relative min-w-0">
        <select
          id="catalog-sort"
          className="filter-select touch-target cursor-pointer appearance-none rounded-lg border border-border bg-background py-2 pl-3 pr-9 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          value={filters.sort}
          aria-label={copy.sortLabel}
          onChange={(event) => {
            const sort = event.target.value as CatalogSort;
            if (!CATALOG_SORT_VALUES.includes(sort)) return;
            router.push(catalogHref(pathname, filters, { sort }), { scroll: false });
          }}
        >
          {CATALOG_SORT_VALUES.map((sort) => (
            <option key={sort} value={sort}>
              {labels[sort]}
            </option>
          ))}
        </select>
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        >
          <path d="m6 8 4 4 4-4" />
        </svg>
      </div>
    </div>
  );
}
