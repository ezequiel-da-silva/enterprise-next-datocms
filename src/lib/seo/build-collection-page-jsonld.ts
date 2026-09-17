import type { AppLocale } from "@/constants/i18n";
import { buildPageWebPageJsonLd } from "@/lib/seo/build-page-webpage-jsonld";
import type { StorefrontCollection } from "@/infra/shopify/storefront";
import { productPagePath } from "@/lib/datocms/product-page-path";
import { getSiteBaseUrl } from "@/lib/seo/site-config";

export function buildCollectionPageJsonLd(input: {
  locale: AppLocale;
  path: string;
  title: string;
  description?: string | null;
  catalog: { name: string; path: string };
  storefront: StorefrontCollection | null;
}): Record<string, unknown>[] {
  const description = input.description?.trim() || undefined;
  const pageGraph = buildPageWebPageJsonLd({
    path: input.path,
    title: input.title,
    description: description ?? null,
    locale: input.locale,
    breadcrumbTrail: [{ name: input.catalog.name, path: input.catalog.path }],
  });

  const itemListElement =
    input.storefront?.products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: new URL(productPagePath(input.locale, product.handle), `${getSiteBaseUrl()}/`).toString(),
      name: product.title,
    })) ?? [];

  const collection: Record<string, unknown> = {
    "@type": "CollectionPage",
    name: input.title,
    url: new URL(input.path, `${getSiteBaseUrl()}/`).toString(),
    ...(description ? { description } : {}),
    ...(input.storefront?.image?.url ? { image: input.storefront.image.url } : {}),
    ...(itemListElement.length > 0
      ? {
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: itemListElement.length,
            itemListElement,
          },
        }
      : {}),
  };

  return [collection, ...pageGraph];
}
