import { Container } from "@/components/atoms/container";
import Image from "next/image";
import { BreadcrumbNav } from "@/components/patterns/breadcrumb-nav";
import { JsonLdScript } from "@/components/patterns/seo-manager";
import type { AppLocale } from "@/constants/i18n";
import type { StorefrontProduct } from "@/infra/shopify/storefront";
import { productPagePath } from "@/lib/datocms/product-page-path";
import { buildProductPageJsonLd } from "@/lib/seo/build-product-page-jsonld";
import { crumbsToNavItems, homeBreadcrumbLabel } from "@/lib/seo/breadcrumb-labels";
import { formatStorefrontMoney } from "@/lib/shopify/format-money";

type ProductPageArticleProps = {
  locale: AppLocale;
  handle: string;
  title: string;
  description: string | null;
  catalogPath: string;
  catalogLabel: string;
  storefront: StorefrontProduct | null;
};

function availabilityLabel(locale: AppLocale, available: boolean): string {
  if (locale === "pt") return available ? "Em stock" : "Esgotado";
  if (locale === "es") return available ? "En stock" : "Agotado";
  return available ? "In stock" : "Sold out";
}

export async function ProductPageArticle({
  locale,
  handle,
  title,
  description,
  catalogPath,
  catalogLabel,
  storefront,
}: ProductPageArticleProps) {
  const path = productPagePath(locale, handle);
  const jsonLd = buildProductPageJsonLd({
    locale,
    path,
    title,
    description,
    catalog: { name: catalogLabel, path: catalogPath },
    storefront,
  });
  const image = storefront?.featuredImage;
  const price = storefront?.priceRange.minVariantPrice;
  const available = storefront?.availableForSale ?? false;

  return (
    <Container as="article" size="sm" name="ProductPage" className="py-12">
      <JsonLdScript graph={jsonLd} />
      <header className="space-y-4">
        <BreadcrumbNav
          locale={locale}
          items={crumbsToNavItems([
            { name: homeBreadcrumbLabel(locale), path: `/${locale}` },
            { name: catalogLabel, path: catalogPath },
            { name: title, path },
          ])}
        />
        <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description ? (
          <p className="whitespace-pre-line text-lg text-muted-foreground">{description}</p>
        ) : null}
        {price ? (
          <p className="text-lg font-medium text-foreground">
            {formatStorefrontMoney(locale, price.amount, price.currencyCode)}
          </p>
        ) : null}
        {storefront ? (
          <p className="text-sm text-muted-foreground">{availabilityLabel(locale, available)}</p>
        ) : null}
      </header>

      {image?.url ? (
        <figure className="mt-8 overflow-hidden rounded-xl border border-border bg-muted shadow-sm ring-1 ring-border/40">
          <Image
            src={image.url}
            alt={image.altText?.trim() || title}
            width={image.width && image.width > 0 ? image.width : 800}
            height={image.height && image.height > 0 ? image.height : 800}
            sizes="(max-width: 768px) 100vw, 720px"
            className="h-auto w-full object-cover"
          />
        </figure>
      ) : null}
    </Container>
  );
}
