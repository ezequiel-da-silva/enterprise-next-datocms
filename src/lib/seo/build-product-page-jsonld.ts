import type { AppLocale } from "@/constants/i18n";
import { buildPageWebPageJsonLd } from "@/lib/seo/build-page-webpage-jsonld";
import type { StorefrontMoney, StorefrontProduct } from "@/infra/shopify/storefront";
import { returnPolicyFor, shippingDetailsFor } from "@/lib/seo/merchant-policy";
import { getSiteBaseUrl } from "@/lib/seo/site-config";
import { shopifyCountryFromLocale } from "@/lib/shopify/locale-map";

/** One year ahead, `YYYY-MM-DD`: Storefront prices have no end date, Google recommends one. */
function priceValidUntil(now: Date): string {
  const next = new Date(now);
  next.setUTCFullYear(next.getUTCFullYear() + 1);
  return next.toISOString().slice(0, 10);
}

export function buildProductPageJsonLd(input: {
  locale: AppLocale;
  path: string;
  title: string;
  description?: string | null;
  catalog: { name: string; path: string };
  storefront: StorefrontProduct | null;
  /** Brand when Shopify has no `vendor` (organization name). */
  brandName: string;
  now?: Date;
  env?: Record<string, string | undefined>;
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
  const country = shopifyCountryFromLocale(input.locale);
  const validUntil = priceValidUntil(input.now ?? new Date());
  const returnPolicy = returnPolicyFor(country, input.env);

  type OfferSource = { price: StorefrontMoney; available: boolean; name: string | null; sku: string | null };
  const offerSources: OfferSource[] = !storefront
    ? []
    : storefront.variants.length > 0
      ? storefront.variants.map((variant) => ({
          price: variant.price,
          available: variant.availableForSale,
          name: storefront.variants.length > 1 ? variant.title : null,
          sku: variant.sku,
        }))
      : [{ price: storefront.priceRange.minVariantPrice, available: storefront.availableForSale, name: null, sku: null }];
  const offers = offerSources.map((entry) => {
    const shipping = shippingDetailsFor(country, entry.price.currencyCode, input.env);
    return {
      "@type": "Offer",
      ...(entry.name ? { name: entry.name } : {}),
      ...(entry.sku ? { sku: entry.sku } : {}),
      price: entry.price.amount,
      priceCurrency: entry.price.currencyCode,
      priceValidUntil: validUntil,
      availability: entry.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url,
      ...(shipping ? { shippingDetails: shipping } : {}),
      ...(returnPolicy ? { hasMerchantReturnPolicy: returnPolicy } : {}),
    };
  });

  const imageUrls = storefront
    ? [...new Set([storefront.featuredImage?.url, ...storefront.images.map((image) => image.url)])].filter(
        (value): value is string => Boolean(value),
      )
    : [];

  const brandName = storefront?.vendor || input.brandName.trim();
  const productSku = offerSources.length === 1 ? offerSources[0]?.sku : null;

  const product: Record<string, unknown> = {
    "@type": "Product",
    name: storefront?.title ?? input.title,
    url,
    ...(description ? { description } : {}),
    ...(productSku ? { sku: productSku } : {}),
    ...(brandName ? { brand: { "@type": "Brand", name: brandName } } : {}),
    ...(imageUrls.length === 1 ? { image: imageUrls[0] } : {}),
    ...(imageUrls.length > 1 ? { image: imageUrls } : {}),
    ...(offers.length === 1 ? { offers: offers[0] } : {}),
    ...(offers.length > 1 ? { offers } : {}),
  };

  return [product, ...pageGraph];
}
