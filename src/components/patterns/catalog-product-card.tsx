import { CatalogProductMedia } from "@/components/patterns/catalog-product-media";
import { WishlistToggleButton } from "@/components/patterns/wishlist-toggle-button";
import type { AppLocale } from "@/constants/i18n";
import type { StorefrontCollectionProduct } from "@/infra/shopify/storefront";
import { productPagePath } from "@/lib/datocms/product-page-path";
import { cn } from "@/lib/cn";
import { PDP_COPY, snowboardBadgeLabel } from "@/lib/i18n/pdp-copy";
import { formatStorefrontMoney } from "@/lib/shopify/format-money";
import Link from "next/link";

const DEFAULT_SIZES = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

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
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-foreground/20",
        soldOut && "opacity-90",
      )}
    >
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
            <p className="pointer-events-none absolute bottom-3 left-3 z-10 rounded-md bg-background/95 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground ring-1 ring-border">
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
