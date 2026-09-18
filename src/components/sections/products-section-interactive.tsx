"use client";

import { Button } from "@/components/atoms/button";
import { CatalogProductCard } from "@/components/patterns/catalog-product-card";
import { ProductsSectionCarousel } from "@/components/sections/products-section-carousel";
import type { AppLocale } from "@/constants/i18n";
import type { StorefrontCollectionProduct } from "@/infra/shopify/storefront";
import type { CarouselSetting } from "@/lib/datocms/resolve-carousel-setting";
import type { ProductsDisplayType } from "@/lib/datocms/resolve-products-section";
import { productsSectionCopy } from "@/lib/i18n/products-section-copy";
import { useId, useState } from "react";

const CARD_SIZES = "(max-width: 767px) calc(100vw - 2rem), (max-width: 1023px) 50vw, 360px";

type ProductsSectionInteractiveProps = {
  locale: AppLocale;
  products: StorefrontCollectionProduct[];
  displayType: ProductsDisplayType;
  initialCount: number;
  loadMoreStep: number;
  loadMoreLabel: string;
  carousel: CarouselSetting;
};

export function ProductsSectionInteractive({
  locale,
  products,
  displayType,
  initialCount,
  loadMoreStep,
  loadMoreLabel,
  carousel,
}: ProductsSectionInteractiveProps) {
  const copy = productsSectionCopy(locale);
  const reactId = useId().replace(/:/g, "");
  const listId = `products-section-list-${reactId}`;
  const [page, setPage] = useState(1);
  const [visibleCount, setVisibleCount] = useState(initialCount);

  const pageCount = Math.max(1, Math.ceil(products.length / initialCount));
  const safePage = Math.min(page, pageCount);
  const pageProducts = products.slice((safePage - 1) * initialCount, safePage * initialCount);
  const visibleProducts =
    displayType === "pagination"
      ? pageProducts
      : displayType === "load_more"
        ? products.slice(0, visibleCount)
        : products;

  return (
    <div id={listId}>
      <p className="sr-only" aria-live="polite">
        {visibleProducts.length === 0
          ? copy.empty
          : displayType === "pagination"
            ? `${copy.results(products.length)}. ${copy.page(safePage, pageCount)}`
            : copy.results(visibleProducts.length)}
      </p>

      {visibleProducts.length === 0 ? (
        <p
          className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground sm:px-6 sm:py-10"
          aria-hidden
        >
          {copy.empty}
        </p>
      ) : displayType === "carousel" ? (
        <ProductsSectionCarousel products={visibleProducts} locale={locale} setting={carousel} />
      ) : (
        <>
          <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-2 lg:grid-cols-3">
            {visibleProducts.map((product) => (
              <li key={product.handle} className="min-w-0">
                <CatalogProductCard locale={locale} product={product} sizes={CARD_SIZES} />
              </li>
            ))}
          </ul>

          {displayType === "pagination" && pageCount > 1 ? (
            <nav className="mt-8 flex flex-wrap justify-center gap-2" aria-label={copy.pagination}>
              <Button
                type="button"
                variant="outline"
                className="touch-target rounded-full"
                aria-label={copy.previousPage}
                disabled={safePage === 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                <span aria-hidden>←</span>
              </Button>
              {Array.from({ length: pageCount }, (_, index) => {
                const pageNumber = index + 1;
                return (
                  <Button
                    key={pageNumber}
                    type="button"
                    variant={pageNumber === safePage ? "primary" : "outline"}
                    className="touch-target rounded-full"
                    aria-label={copy.page(pageNumber, pageCount)}
                    aria-current={pageNumber === safePage ? "true" : undefined}
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
              <Button
                type="button"
                variant="outline"
                className="touch-target rounded-full"
                aria-label={copy.nextPage}
                disabled={safePage === pageCount}
                onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
              >
                <span aria-hidden>→</span>
              </Button>
            </nav>
          ) : null}

          {displayType === "load_more" && visibleProducts.length < products.length ? (
            <div className="mt-8 flex justify-center">
              <Button
                type="button"
                variant="outline"
                className="touch-target-text"
                aria-controls={listId}
                onClick={() => setVisibleCount((current) => Math.min(products.length, current + loadMoreStep))}
              >
                {loadMoreLabel}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
