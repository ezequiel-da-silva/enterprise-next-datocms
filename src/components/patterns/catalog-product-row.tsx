"use client";

import type { AppLocale } from "@/constants/i18n";
import type { StorefrontCollectionProduct } from "@/infra/shopify/storefront";
import { productPagePath } from "@/lib/datocms/product-page-path";
import { formatDiscountPill, resolveCompareAtDeal } from "@/lib/shopify/compare-at-price";
import { formatStorefrontMoney } from "@/lib/shopify/format-money";
import Image from "next/image";
import Link from "next/link";

const VIEW_LABEL: Record<AppLocale, string> = {
  en: "View",
  pt: "Ver",
  es: "Ver",
};

type CatalogProductRowProps = {
  locale: AppLocale;
  product: StorefrontCollectionProduct;
  /** Close parent drawer / navigate cleanup. */
  onNavigate?: () => void;
  viewLabel?: string;
};

/**
 * Compact cross-sell row for narrow surfaces (empty cart drawer).
 * Square thumb + title + price + View CTA — not a full catalog card.
 */
export function CatalogProductRow({
  locale,
  product,
  onNavigate,
  viewLabel = VIEW_LABEL[locale],
}: CatalogProductRowProps) {
  const href = productPagePath(locale, product.handle);
  const price = product.priceRange.minVariantPrice;
  const deal = resolveCompareAtDeal(locale, price, product.compareAtPrice);
  const image = product.featuredImage;
  const soldOut = !product.availableForSale;

  return (
    <article
      data-product-row={product.handle}
      className="flex items-center gap-3 py-3"
    >
      <Link
        href={href}
        onClick={onNavigate}
        className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {image?.url ? (
          <Image
            src={image.url}
            alt={image.altText?.trim() || product.title}
            width={64}
            height={64}
            sizes="64px"
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="block size-16 bg-muted" aria-hidden />
        )}
      </Link>

      <div className="min-w-0 flex-1 space-y-1">
        <Link
          href={href}
          onClick={onNavigate}
          className="line-clamp-2 text-sm font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {product.title}
        </Link>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
          <span className="font-semibold text-foreground">
            {formatStorefrontMoney(locale, price.amount, price.currencyCode)}
          </span>
          {deal ? (
            <>
              <s className="text-muted-foreground">{deal.compareAtPriceLabel}</s>
              <span className="rounded-md bg-foreground px-1.5 py-0.5 text-xs font-semibold text-background">
                {formatDiscountPill(deal.discountPercent)}
              </span>
            </>
          ) : null}
          {soldOut ? <span className="text-muted-foreground">{locale === "pt" ? "Esgotado" : locale === "es" ? "Agotado" : "Sold out"}</span> : null}
        </p>
      </div>

      <Link
        href={href}
        onClick={onNavigate}
        className="shrink-0 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {viewLabel}
      </Link>
    </article>
  );
}
