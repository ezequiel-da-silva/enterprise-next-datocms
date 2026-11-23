"use client";

import { CatalogProductCard } from "@/components/patterns/catalog-product-card";
import { CatalogProductRow } from "@/components/patterns/catalog-product-row";
import type { AppLocale } from "@/constants/i18n";
import type { StorefrontCollectionProduct } from "@/infra/shopify/storefront";
import {
  getRecentlyViewedServerSnapshot,
  getRecentlyViewedSnapshot,
  subscribeRecentlyViewed,
} from "@/lib/shopify/recently-viewed";
import { useEffect, useState, useSyncExternalStore } from "react";

const CARD_SIZES = "(max-width: 767px) calc(50vw - 1.5rem), (max-width: 1023px) 33vw, 240px";

type RecentlyViewedSectionProps = {
  locale: AppLocale;
  title: string;
  /** Current PDP handle — omitted from the grid. */
  excludeHandle?: string | null;
  className?: string;
  /**
   * `drawer`: compact cross-sell rows (empty cart drawer).
   * `grid`: responsive multi-column catalog cards (PDP / cart page).
   */
  layout?: "grid" | "drawer";
  /** Close cart drawer when following a product link (drawer layout). */
  onProductNavigate?: () => void;
};

type FetchState = {
  key: string;
  products: StorefrontCollectionProduct[];
};

export function RecentlyViewedSection({
  locale,
  title,
  excludeHandle = null,
  className,
  layout = "grid",
  onProductNavigate,
}: RecentlyViewedSectionProps) {
  const handles = useSyncExternalStore(
    subscribeRecentlyViewed,
    getRecentlyViewedSnapshot,
    getRecentlyViewedServerSnapshot,
  );
  const filtered = handles.filter((handle) => handle !== excludeHandle).slice(0, 8);
  const handlesKey = filtered.join(",");
  const [fetched, setFetched] = useState<FetchState | null>(null);

  useEffect(() => {
    if (!handlesKey) return;

    let cancelled = false;
    const params = new URLSearchParams({
      locale,
      handles: handlesKey,
    });

    void fetch(`/api/catalog/by-handles?${params.toString()}`)
      .then(async (res) => {
        if (!res.ok) return [] as StorefrontCollectionProduct[];
        const json = (await res.json()) as { products?: StorefrontCollectionProduct[] };
        return Array.isArray(json.products) ? json.products : [];
      })
      .then((products) => {
        if (!cancelled) setFetched({ key: handlesKey, products });
      })
      .catch(() => {
        if (!cancelled) setFetched({ key: handlesKey, products: [] });
      });

    return () => {
      cancelled = true;
    };
  }, [handlesKey, locale]);

  const products = !handlesKey ? [] : fetched?.key === handlesKey ? fetched.products : null;
  if (!products || products.length === 0) return null;

  return (
    <section
      data-ui-section="RecentlyViewed"
      className={className ?? "space-y-4"}
      aria-label={title}
    >
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {layout === "drawer" ? (
        <ul className="m-0 divide-y divide-border p-0">
          {products.map((product) => (
            <li key={product.handle} className="min-w-0 list-none">
              <CatalogProductRow
                locale={locale}
                product={product}
                onNavigate={onProductNavigate}
              />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <li key={product.handle} className="min-w-0">
              <CatalogProductCard locale={locale} product={product} sizes={CARD_SIZES} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
