"use client";

import { CatalogProductCard } from "@/components/patterns/catalog-product-card";
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
   * `drawer`: single-column full-width cards (cart drawer ~24rem).
   * `grid`: responsive multi-column (PDP / cart page).
   */
  layout?: "grid" | "drawer";
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
      <ul
        className={
          layout === "drawer"
            ? "grid grid-cols-1 gap-3"
            : "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        }
      >
        {products.map((product) => (
          <li key={product.handle} className="min-w-0">
            <CatalogProductCard
              locale={locale}
              product={product}
              sizes={layout === "drawer" ? "(max-width: 1023px) 100vw, 320px" : CARD_SIZES}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
