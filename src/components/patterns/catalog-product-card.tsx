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
    <Link
      href={href}
      className="group block overflow-hidden rounded-xl border border-border bg-card shadow-sm ring-1 ring-border/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {image?.url ? (
        <Image
          src={image.url}
          alt={image.altText?.trim() || product.title}
          width={image.width && image.width > 0 ? image.width : 600}
          height={image.height && image.height > 0 ? image.height : 600}
          sizes={sizes}
          className="aspect-square h-auto w-full object-cover"
        />
      ) : (
        <div className="aspect-square bg-muted" aria-hidden="true" />
      )}
      <div className="space-y-1 p-4">
        <p className="font-medium text-foreground group-hover:underline">{product.title}</p>
        <p className="text-sm text-muted-foreground">{formatStorefrontMoney(locale, price.amount, price.currencyCode)}</p>
      </div>
    </Link>
  );
}
