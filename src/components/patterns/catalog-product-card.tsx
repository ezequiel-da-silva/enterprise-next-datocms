import { CatalogProductMedia } from "@/components/patterns/catalog-product-media";
import { WishlistToggleButton } from "@/components/patterns/wishlist-toggle-button";
import type { AppLocale } from "@/constants/i18n";
import type { StorefrontCollectionProduct } from "@/infra/shopify/storefront";
import { productPagePath } from "@/lib/datocms/product-page-path";
import { PDP_COPY, snowboardBadgeLabel } from "@/lib/i18n/pdp-copy";
import { formatStorefrontMoney } from "@/lib/shopify/format-money";
import Link from "next/link";

/** Align with products-section / carousel CARD_SIZES. */
const DEFAULT_SIZES = "(max-width: 767px) calc(100vw - 2rem), (max-width: 1023px) 50vw, 360px";

type CatalogProductCardProps = {
  locale: AppLocale;
  product: StorefrontCollectionProduct;
  sizes?: string;
};

export function CatalogProductCard({ locale, product, sizes = DEFAULT_SIZES }: CatalogProductCardProps) {
  const href = productPagePath(locale, product.handle);
  const image = product.featuredImage;
  const hoverImage = product.hoverImage;
  const price = product.priceRange.minVariantPrice;
  const soldOut = !product.availableForSale;
  const soldOutLabel = PDP_COPY[locale].soldOut;
  const marketingBadge = snowboardBadgeLabel(locale, product.badge);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-foreground/20">
      <WishlistToggleButton
        locale={locale}
        className="absolute right-3 top-3 z-20"
        item={{
          handle: product.handle,
          title: product.title,
          imageUrl: image?.url ?? null,
          priceAmount: price.amount,
          currencyCode: price.currencyCode,
        }}
      />
      {marketingBadge ? (
        <p className="pointer-events-none absolute left-3 top-3 z-10 rounded-md bg-foreground px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-background">
          {marketingBadge}
        </p>
      ) : null}
      <Link
        href={href}
        className="flex h-full flex-col rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <div className="relative">
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
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="text-balance text-lg font-semibold tracking-tight text-foreground group-hover:text-primary">
            {product.title}
          </h3>
          <p className="mt-auto pt-1 text-sm text-muted-foreground">
            {formatStorefrontMoney(locale, price.amount, price.currencyCode)}
          </p>
        </div>
      </Link>
    </article>
  );
}
