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
      <select
        id="catalog-sort"
        className="touch-target rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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
    </div>
  );
}
