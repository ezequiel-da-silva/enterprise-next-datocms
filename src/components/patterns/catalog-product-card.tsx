import { CatalogProductMedia } from "@/components/patterns/catalog-product-media";
import {
  CatalogProductQuickAdd,
  type CatalogProductQuickAddProps,
} from "@/components/patterns/quick-add-drawer";
import { WishlistToggleButton } from "@/components/patterns/wishlist-toggle-button";
import type { AppLocale } from "@/constants/i18n";
import type { StorefrontCollectionProduct } from "@/infra/shopify/storefront";
import { productPagePath } from "@/lib/datocms/product-page-path";
import { PDP_COPY, snowboardBadgeLabel } from "@/lib/i18n/pdp-copy";
import { formatDiscountPill, resolveCompareAtDeal } from "@/lib/shopify/compare-at-price";
import { formatStorefrontMoney } from "@/lib/shopify/format-money";
import Link from "next/link";

/** Align with products-section / carousel CARD_SIZES. */
const DEFAULT_SIZES = "(max-width: 767px) calc(100vw - 2rem), (max-width: 1023px) 50vw, 360px";

export type CatalogProductCardQuickAdd = Omit<
  CatalogProductQuickAddProps,
  "locale" | "handle" | "title"
>;

type CatalogProductCardProps = {
  locale: AppLocale;
  product: StorefrontCollectionProduct;
  sizes?: string;
  /** When set (cart enabled), shows hover / mobile quick-add. */
  quickAdd?: CatalogProductCardQuickAdd | null;
};

export function CatalogProductCard({
  locale,
  product,
  sizes = DEFAULT_SIZES,
  quickAdd = null,
}: CatalogProductCardProps) {
  const href = productPagePath(locale, product.handle);
  const image = product.featuredImage;
  const hoverImage = product.hoverImage;
  const price = product.priceRange.minVariantPrice;
  const deal = resolveCompareAtDeal(locale, price, product.compareAtPrice);
  const soldOut = !product.availableForSale;
  const soldOutLabel = PDP_COPY[locale].soldOut;
  const marketingBadge = snowboardBadgeLabel(locale, product.badge);
  const showQuickAdd = Boolean(quickAdd) && !soldOut;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden">
      <WishlistToggleButton
        locale={locale}
        revealOnCardHover
        className="absolute right-3 top-3 z-20"
        item={{
          handle: product.handle,
          title: product.title,
          imageUrl: image?.url ?? null,
          priceAmount: price.amount,
          currencyCode: price.currencyCode,
          compareAtAmount: deal && product.compareAtPrice ? product.compareAtPrice.amount : null,
        }}
      />
      {marketingBadge ? (
        <p className="pointer-events-none absolute left-3 top-3 z-10 rounded-md bg-foreground px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-background">
          {marketingBadge}
        </p>
      ) : null}

      <div className="relative">
        <Link
          href={href}
          className="block rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <CatalogProductMedia
            locale={locale}
            title={product.title}
            image={image}
            hoverImage={hoverImage}
            sizes={sizes}
            soldOut={soldOut}
          />
          {soldOut ? (
            <p className="pointer-events-none absolute bottom-3 left-3 z-10 rounded-md bg-background/95 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-foreground ring-1 ring-border">
              {soldOutLabel}
            </p>
          ) : null}
        </Link>
        {showQuickAdd && quickAdd ? (
          <CatalogProductQuickAdd
            locale={locale}
            handle={product.handle}
            title={product.title}
            action={quickAdd.action}
            cartHref={quickAdd.cartHref}
            cartCopy={quickAdd.cartCopy}
            labels={quickAdd.labels}
          />
        ) : null}
      </div>

      <Link
        href={href}
        className="flex flex-1 flex-col gap-1.5 px-1 pb-2 pt-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <h3 className="text-balance text-sm font-medium tracking-tight text-foreground group-hover:text-primary sm:text-base">
          {product.title}
        </h3>
        {product.ratingSummary && product.ratingSummary.count > 0 ? (
          <p
            className="text-xs text-muted-foreground"
            aria-label={`${product.ratingSummary.average.toLocaleString(locale)} (${product.ratingSummary.count})`}
          >
            ★ {product.ratingSummary.average.toLocaleString(locale)} ({product.ratingSummary.count})
          </p>
        ) : null}
        <p className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-1 text-base font-semibold text-foreground">
          <span>{formatStorefrontMoney(locale, price.amount, price.currencyCode)}</span>
          {deal ? (
            <>
              <s className="text-sm font-normal text-muted-foreground">{deal.compareAtPriceLabel}</s>
              <span
                data-discount-pill=""
                className="rounded-md bg-foreground px-1.5 py-0.5 text-xs font-semibold text-background"
              >
                {formatDiscountPill(deal.discountPercent)}
              </span>
            </>
          ) : null}
        </p>
      </Link>
    </article>
  );
}
