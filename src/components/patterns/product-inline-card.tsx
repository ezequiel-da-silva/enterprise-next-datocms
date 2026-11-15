import type { AppLocale } from "@/constants/i18n";
import type { StorefrontCollectionProduct } from "@/infra/shopify/storefront";
import { productPagePath } from "@/lib/datocms/product-page-path";
import { PDP_COPY } from "@/lib/i18n/pdp-copy";
import { formatDiscountPill, resolveCompareAtDeal } from "@/lib/shopify/compare-at-price";
import { formatStorefrontMoney } from "@/lib/shopify/format-money";
import Image from "next/image";
import Link from "next/link";

type ProductInlineCardProps = {
  locale: AppLocale;
  product: StorefrontCollectionProduct;
};

/**
 * Compact product card for inline records in Structured Text (blog / pages).
 * Phrasing content only (`a` + `span`): inline records render inside `<p>`, so no `article` / `div`.
 */
export function ProductInlineCard({ locale, product }: ProductInlineCardProps) {
  const price = product.priceRange.minVariantPrice;
  const deal = resolveCompareAtDeal(locale, price, product.compareAtPrice);
  const image = product.featuredImage;
  const soldOut = !product.availableForSale;
  const profile = product.profile?.trim() || null;
  const flexLabel =
    typeof product.flex === "number" && Number.isFinite(product.flex) ? String(product.flex) : null;
  const specsMeta = [profile, flexLabel].filter(Boolean).join(" · ");

  return (
    <Link
      href={productPagePath(locale, product.handle)}
      data-product-inline-card={product.handle}
      className="not-prose my-2 flex max-w-sm items-center gap-3 rounded-xl border border-border bg-card p-3 no-underline transition-colors hover:border-foreground/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {image?.url ? (
        <Image
          src={image.url}
          alt={image.altText?.trim() || product.title}
          width={64}
          height={64}
          sizes="64px"
          loading="lazy"
          className="size-16 shrink-0 rounded-lg bg-muted object-cover"
        />
      ) : (
        <span className="block size-16 shrink-0 rounded-lg bg-muted" aria-hidden />
      )}
      <span className="flex min-w-0 flex-col gap-1">
        <span className="text-balance text-sm font-semibold tracking-tight text-foreground">{product.title}</span>
        {specsMeta ? <span className="text-xs text-muted-foreground">{specsMeta}</span> : null}
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <span>{formatStorefrontMoney(locale, price.amount, price.currencyCode)}</span>
          {deal ? (
            <>
              <s>{deal.compareAtPriceLabel}</s>
              <span
                data-discount-pill=""
                className="rounded-md bg-foreground px-1.5 py-0.5 text-xs font-semibold text-background"
              >
                {formatDiscountPill(deal.discountPercent)}
              </span>
            </>
          ) : null}
          {soldOut ? (
            <span className="text-xs font-semibold uppercase tracking-wide text-foreground">
              {PDP_COPY[locale].soldOut}
            </span>
          ) : null}
        </span>
      </span>
    </Link>
  );
}
