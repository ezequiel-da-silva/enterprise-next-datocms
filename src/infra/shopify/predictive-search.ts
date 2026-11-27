import type { AppLocale } from "@/constants/i18n";
import {
  asRecord,
  readImage,
  readMoney,
  storefrontGraphql,
  type StorefrontCollectionProduct,
} from "@/infra/shopify/storefront";
import { productPagePath } from "@/lib/datocms/product-page-path";
import type { SearchHit } from "@/lib/datocms/search-hit";
import { shopifyCountryFromLocale, shopifyLanguageFromLocale } from "@/lib/shopify/locale-map";

const PREDICTIVE_LIMIT = 4;
/** Soft ceiling so a slow Storefront never blocks the header preview. */
const PREDICTIVE_TIMEOUT_MS = 1_500;

const PREDICTIVE_PRODUCTS_QUERY = /* GraphQL */ `
  query PredictiveProducts($query: String!, $country: CountryCode!, $language: LanguageCode!)
  @inContext(country: $country, language: $language) {
    predictiveSearch(
      query: $query
      limit: ${PREDICTIVE_LIMIT}
      types: [PRODUCT]
      unavailableProducts: LAST
    ) {
      products {
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
`;

/**
 * Maps a Shopify predictiveSearch product node to a catalog card shape.
 * Exported for unit tests.
 */
export function mapPredictiveProduct(value: unknown): StorefrontCollectionProduct | null {
  const record = asRecord(value);
  if (!record) return null;
  if (typeof record.handle !== "string" || !record.handle.trim()) return null;
  if (typeof record.title !== "string" || !record.title.trim()) return null;
  const minPrice = readMoney(asRecord(record.priceRange)?.minVariantPrice);
  if (!minPrice) return null;
  const compareAt = readMoney(asRecord(record.compareAtPriceRange)?.minVariantPrice);
  return {
    handle: record.handle.trim(),
    title: record.title.trim(),
    availableForSale: record.availableForSale === true,
    featuredImage: readImage(record.featuredImage),
    hoverImage: null,
    badge: null,
    priceRange: { minVariantPrice: minPrice },
    compareAtPrice: compareAt,
    sizes: [],
  };
}

function parsePredictiveProducts(payload: { data?: unknown; errors?: unknown } | null): StorefrontCollectionProduct[] {
  if (!payload || payload.errors) return [];
  const data = asRecord(payload.data);
  const predictive = asRecord(data?.predictiveSearch);
  const products = predictive?.products;
  if (!Array.isArray(products)) return [];
  return products
    .map(mapPredictiveProduct)
    .filter((product): product is StorefrontCollectionProduct => product !== null)
    .slice(0, PREDICTIVE_LIMIT);
}

async function storefrontGraphqlWithTimeout(
  query: string,
  variables: Record<string, unknown>,
  timeoutMs: number,
): Promise<{ data?: unknown; errors?: unknown } | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      storefrontGraphql(query, variables),
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), timeoutMs);
      }),
    ]);
  } catch {
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Shopify Storefront predictiveSearch for products only.
 * Missing env, network/GraphQL errors, or timeout → empty array (never throws).
 */
export async function predictiveSearchProducts(
  query: string,
  locale: AppLocale,
): Promise<StorefrontCollectionProduct[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const payload = await storefrontGraphqlWithTimeout(
    PREDICTIVE_PRODUCTS_QUERY,
    {
      query: q,
      country: shopifyCountryFromLocale(locale),
      language: shopifyLanguageFromLocale(locale),
    },
    PREDICTIVE_TIMEOUT_MS,
  );

  return parsePredictiveProducts(payload);
}

/** Convert Storefront cards into `SearchHit` rows for the preview payload. */
export function predictiveProductsToHits(
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
