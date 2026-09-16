import type { AppLocale } from "@/constants/i18n";
import { buildPageWebPageJsonLd } from "@/lib/seo/build-page-webpage-jsonld";
import type { StorefrontProduct } from "@/infra/shopify/storefront";
import { getSiteBaseUrl } from "@/lib/seo/site-config";

export function buildProductPageJsonLd(input: {
  locale: AppLocale;
  path: string;
  title: string;
  description?: string | null;
  catalog: { name: string; path: string };
  storefront: StorefrontProduct | null;
}): Record<string, unknown>[] {
  const description = input.description?.trim() || undefined;
  const pageGraph = buildPageWebPageJsonLd({
    path: input.path,
    title: input.title,
    description: description ?? null,
    locale: input.locale,
    breadcrumbTrail: [{ name: input.catalog.name, path: input.catalog.path }],
  });

  const offer = input.storefront
    ? {
        "@type": "Offer",
        price: input.storefront.priceRange.minVariantPrice.amount,
        priceCurrency: input.storefront.priceRange.minVariantPrice.currencyCode,
        availability: input.storefront.availableForSale
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        url: new URL(input.path, `${getSiteBaseUrl()}/`).toString(),
      }
    : undefined;

  const product: Record<string, unknown> = {
    "@type": "Product",
    name: input.storefront?.title ?? input.title,
    url: new URL(input.path, `${getSiteBaseUrl()}/`).toString(),
    ...(description ? { description } : {}),
    ...(input.storefront?.featuredImage?.url ? { image: input.storefront.featuredImage.url } : {}),
    ...(offer ? { offers: offer } : {}),
  };

  return [product, ...pageGraph];
}
