import type { AppLocale } from "@/constants/i18n";
import type { StorefrontCollectionProduct } from "@/infra/shopify/storefront";
import { productPagePath } from "@/lib/datocms/product-page-path";
import { formatStorefrontMoney } from "@/lib/shopify/format-money";
import Image from "next/image";
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
  const price = product.priceRange.minVariantPrice;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm ring-1 ring-border/40 transition hover:border-primary/25 hover:shadow-md">
      <Link
        href={href}
        className="flex h-full flex-col rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-muted">
          {image?.url ? (
            <Image
              src={image.url}
              alt={image.altText?.trim() || product.title}
              width={image.width && image.width > 0 ? image.width : 600}
              height={image.height && image.height > 0 ? image.height : 600}
              sizes={sizes}
              className="h-full w-full object-cover motion-safe:transition motion-safe:duration-300 motion-safe:group-hover:scale-[1.02]"
            />
          ) : null}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <p className="text-balance text-lg font-semibold tracking-tight text-foreground group-hover:text-primary">
            {product.title}
          </p>
          <p className="mt-auto pt-1 text-sm text-muted-foreground">
            {formatStorefrontMoney(locale, price.amount, price.currencyCode)}
          </p>
        </div>
      </Link>
    </article>
  );
}
