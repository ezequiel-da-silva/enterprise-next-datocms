import type { AppLocale } from "@/constants/i18n";
import { mapPredictiveProduct } from "@/infra/shopify/predictive-search";
import {
  asRecord,
  storefrontGraphql,
  type StorefrontCollectionProduct,
} from "@/infra/shopify/storefront";
import { productPagePath } from "@/lib/datocms/product-page-path";
import type { SearchHit } from "@/lib/datocms/search-hit";
import { shopifyCountryFromLocale, shopifyLanguageFromLocale } from "@/lib/shopify/locale-map";

const DEFAULT_FIRST = 24;

const CATALOG_SEARCH_QUERY = /* GraphQL */ `
  query CatalogProductSearch(
    $query: String!
    $first: Int!
    $country: CountryCode!
    $language: LanguageCode!
  ) @inContext(country: $country, language: $language) {
    search(query: $query, first: $first, types: [PRODUCT], unavailableProducts: LAST) {
      nodes {
        ... on Product {
          id
          handle
          title
          availableForSale
          featuredImage {
            url
            altText
            width
            height
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          compareAtPriceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

/** Parse Storefront `search` product nodes (exported for tests). */
export function parseCatalogSearchProducts(
  payload: { data?: unknown; errors?: unknown } | null,
  limit = DEFAULT_FIRST,
): StorefrontCollectionProduct[] {
  if (!payload || payload.errors) return [];
  const data = asRecord(payload.data);
  const search = asRecord(data?.search);
  const nodes = search?.nodes;
  if (!Array.isArray(nodes)) return [];
  return nodes
    .map(mapPredictiveProduct)
    .filter((product): product is StorefrontCollectionProduct => product !== null)
    .slice(0, limit);
}

/**
 * Full-page Storefront product search (live prices / availability).
 * Missing env or API failure → `[]` (never throws).
 */
export async function searchStorefrontProducts(
  query: string,
  locale: AppLocale,
  first: number = DEFAULT_FIRST,
): Promise<StorefrontCollectionProduct[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const payload = await storefrontGraphql(CATALOG_SEARCH_QUERY, {
    query: q,
    first: Math.min(Math.max(first, 1), 50),
    country: shopifyCountryFromLocale(locale),
    language: shopifyLanguageFromLocale(locale),
  });

  return parseCatalogSearchProducts(payload, first);
}

export function catalogProductsToHits(
  products: StorefrontCollectionProduct[],
  locale: AppLocale,
): SearchHit[] {
  return products.map((product) => ({
    id: product.handle,
    title: product.title,
    href: productPagePath(locale, product.handle),
    kind: "product" as const,
    product,
  }));
}
