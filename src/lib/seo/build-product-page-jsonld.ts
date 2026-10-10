import type { AppLocale } from "@/constants/i18n";
import { buildPageWebPageJsonLd } from "@/lib/seo/build-page-webpage-jsonld";
import type { StorefrontMoney, StorefrontProduct } from "@/infra/shopify/storefront";
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

  const url = new URL(input.path, `${getSiteBaseUrl()}/`).toString();
  const storefront = input.storefront;
  type OfferSource = { price: StorefrontMoney; available: boolean; name: string | null };
  const offerSources: OfferSource[] = !storefront
    ? []
    : storefront.variants.length > 0
      ? storefront.variants.map((variant) => ({
          price: variant.price,
          available: variant.availableForSale,
          name: storefront.variants.length > 1 ? variant.title : null,
        }))
      : [{ price: storefront.priceRange.minVariantPrice, available: storefront.availableForSale, name: null }];
  const offers = offerSources.map((entry) => ({
    "@type": "Offer",
    ...(entry.name ? { name: entry.name } : {}),
    price: entry.price.amount,
    priceCurrency: entry.price.currencyCode,
    availability: entry.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    url,
  }));

  const imageUrls = storefront
    ? [...new Set([storefront.featuredImage?.url, ...storefront.images.map((image) => image.url)])].filter(
        (value): value is string => Boolean(value),
      )
    : [];

  const product: Record<string, unknown> = {
    "@type": "Product",
    name: storefront?.title ?? input.title,
    url,
    ...(description ? { description } : {}),
    ...(imageUrls.length === 1 ? { image: imageUrls[0] } : {}),
    ...(imageUrls.length > 1 ? { image: imageUrls } : {}),
    ...(offers.length === 1 ? { offers: offers[0] } : {}),
    ...(offers.length > 1 ? { offers } : {}),
  };

  return [product, ...pageGraph];
}
