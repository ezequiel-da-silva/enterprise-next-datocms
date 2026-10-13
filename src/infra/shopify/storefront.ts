import type { AppLocale } from "@/constants/i18n";
import { SHOPIFY_STOREFRONT_API_VERSION as STOREFRONT_API_VERSION } from "@/infra/shopify/api-version";
import {
  SHOPIFY_CATALOG_REVALIDATE_SEC,
  SHOPIFY_CATALOG_TAG,
  SHOPIFY_PRODUCTS_TAG,
  shopifyProductTag,
} from "@/lib/shopify/cache-tags";
import { shopifyCountryFromLocale } from "@/lib/shopify/locale-map";

function catalogCache(tags: string[]): { revalidate: number; tags: string[] } {
  return { revalidate: SHOPIFY_CATALOG_REVALIDATE_SEC, tags };
}

export type StorefrontMoney = {
  amount: string;
  currencyCode: string;
};

export type StorefrontProductImage = {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
};

export type StorefrontSelectedOption = {
  name: string;
  value: string;
};

export type StorefrontVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
  price: StorefrontMoney;
  selectedOptions: StorefrontSelectedOption[];
  image: StorefrontProductImage | null;
  sku: string | null;
};

export type StorefrontProduct = {
  id: string;
  title: string;
  handle: string;
  vendor: string | null;
  availableForSale: boolean;
  featuredImage: StorefrontProductImage | null;
  images: StorefrontProductImage[];
  priceRange: { minVariantPrice: StorefrontMoney };
  variants: StorefrontVariant[];
};

const PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  query ProductByHandle($handle: String!, $country: CountryCode!) @inContext(country: $country) {
    product(handle: $handle) {
      id
      title
      handle
      vendor
      availableForSale
      featuredImage {
        url
        altText
        width
        height
      }
      images(first: 10) {
        nodes {
          url
          altText
          width
          height
        }
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      variants(first: 50) {
        nodes {
          id
          title
          availableForSale
          quantityAvailable
          sku
          price {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
          image {
            url
            altText
            width
            height
          }
        }
      }
    }
  }
`;

function readEnv(name: "SHOPIFY_STORE_DOMAIN" | "SHOPIFY_STOREFRONT_ACCESS_TOKEN"): string | undefined {
  const raw = process.env[name];
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function shopDomain(): string | undefined {
  const raw = readEnv("SHOPIFY_STORE_DOMAIN");
  if (!raw) return undefined;
  return raw.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function storefrontShopDomain(): string | undefined {
  return shopDomain();
}

/** POST to the Storefront API; `null` on missing env, network or HTTP error. Never cached. */
export async function storefrontGraphql(
  query: string,
  variables: Record<string, unknown>,
): Promise<{ data?: unknown; errors?: unknown } | null> {
  const shop = shopDomain();
  const token = readEnv("SHOPIFY_STOREFRONT_ACCESS_TOKEN");
  if (!shop || !token) return null;
  try {
    const res = await fetch(`https://${shop}/api/${STOREFRONT_API_VERSION}/graphql.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...storefrontAuthHeaders(token) },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as { data?: unknown; errors?: unknown };
  } catch {
    return null;
  }
}

/** Headless private tokens (`shpat_`) use a different header than the public hex token. */
export function storefrontAuthHeaders(token: string): Record<string, string> {
  if (token.startsWith("shpat_")) {
    return { "Shopify-Storefront-Private-Token": token };
  }
  return { "X-Shopify-Storefront-Access-Token": token };
}

export function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

export function readMoney(value: unknown): StorefrontMoney | null {
  const record = asRecord(value);
  if (!record) return null;
  const amount = typeof record.amount === "string" ? record.amount : null;
  const currencyCode = typeof record.currencyCode === "string" ? record.currencyCode : null;
  if (!amount || !currencyCode) return null;
  return { amount, currencyCode };
}

export function readImage(value: unknown): StorefrontProductImage | null {
  const record = asRecord(value);
  if (!record || typeof record.url !== "string" || !record.url.trim()) return null;
  return {
    url: record.url.trim(),
    altText: typeof record.altText === "string" ? record.altText : null,
    width: typeof record.width === "number" ? record.width : null,
    height: typeof record.height === "number" ? record.height : null,
  };
}

export function readSelectedOptions(value: unknown): StorefrontSelectedOption[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    const record = asRecord(entry);
    if (!record || typeof record.name !== "string" || typeof record.value !== "string") return [];
    return [{ name: record.name, value: record.value }];
  });
}

function readImageNodes(value: unknown): StorefrontProductImage[] {
  const nodes = asRecord(value)?.nodes;
  if (!Array.isArray(nodes)) return [];
  return nodes.map(readImage).filter((image): image is StorefrontProductImage => image !== null);
}

function readVariant(value: unknown): StorefrontVariant | null {
  const record = asRecord(value);
  if (!record || typeof record.id !== "string" || typeof record.title !== "string") return null;
  const price = readMoney(record.price);
  if (!price) return null;
  return {
    id: record.id,
    title: record.title,
    availableForSale: record.availableForSale === true,
    quantityAvailable: typeof record.quantityAvailable === "number" ? record.quantityAvailable : null,
    price,
    selectedOptions: readSelectedOptions(record.selectedOptions),
    image: readImage(record.image),
    sku: readOptionalText(record.sku),
  };
}

function readOptionalText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function mapProduct(value: unknown): StorefrontProduct | null {
  const record = asRecord(value);
  if (!record) return null;
  if (typeof record.id !== "string" || typeof record.handle !== "string" || typeof record.title !== "string") {
    return null;
  }
  const minPrice = readMoney(asRecord(record.priceRange)?.minVariantPrice);
  if (!minPrice) return null;
  const variantNodes = asRecord(record.variants)?.nodes;
  const variants = Array.isArray(variantNodes)
    ? variantNodes.map(readVariant).filter((v): v is StorefrontVariant => v !== null)
    : [];
  return {
    id: record.id,
    title: record.title,
    handle: record.handle,
    vendor: readOptionalText(record.vendor),
    availableForSale: record.availableForSale === true,
    featuredImage: readImage(record.featuredImage),
    images: readImageNodes(record.images),
    priceRange: { minVariantPrice: minPrice },
    variants,
  };
}

/**
 * Storefront GraphQL no servidor. Falha de rede ou token ausente → `null`
 * (o PDP continua com o título Dato).
 */
export type StorefrontCollectionProduct = {
  handle: string;
  title: string;
  availableForSale: boolean;
  featuredImage: StorefrontProductImage | null;
  priceRange: { minVariantPrice: StorefrontMoney };
};

export type StorefrontCollection = {
  id: string;
  handle: string;
  title: string;
  image: StorefrontProductImage | null;
  products: StorefrontCollectionProduct[];
};

export type StorefrontCollectionMeta = {
  handle: string;
  title: string;
  image: StorefrontProductImage | null;
};

const COLLECTION_META_QUERY = /* GraphQL */ `
  query CollectionMeta($handle: String!, $country: CountryCode!) @inContext(country: $country) {
    collection(handle: $handle) {
      handle
      title
      image {
        url
        altText
        width
        height
      }
    }
  }
`;

const COLLECTION_PRODUCT_FIELDS = `
  title
  handle
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
`;

const COLLECTION_BY_HANDLE_QUERY = /* GraphQL */ `
  query CollectionByHandle($handle: String!, $country: CountryCode!) @inContext(country: $country) {
    collection(handle: $handle) {
      id
      handle
      title
      image {
        url
        altText
        width
        height
      }
      products(first: 50) {
        nodes {
          ${COLLECTION_PRODUCT_FIELDS}
        }
      }
    }
  }
`;

const PRODUCTS_QUERY = /* GraphQL */ `
  query StorefrontProducts($country: CountryCode!) @inContext(country: $country) {
    products(first: 50) {
      nodes {
        ${COLLECTION_PRODUCT_FIELDS}
      }
    }
  }
`;

function mapCollectionProduct(value: unknown): StorefrontCollectionProduct | null {
  const record = asRecord(value);
  if (!record) return null;
  if (typeof record.handle !== "string" || typeof record.title !== "string") return null;
  const minPrice = readMoney(asRecord(record.priceRange)?.minVariantPrice);
  if (!minPrice) return null;
  return {
    handle: record.handle,
    title: record.title,
    availableForSale: record.availableForSale === true,
    featuredImage: readImage(record.featuredImage),
    priceRange: { minVariantPrice: minPrice },
  };
}

function mapCollection(value: unknown): StorefrontCollection | null {
  const record = asRecord(value);
  if (!record) return null;
  if (typeof record.id !== "string" || typeof record.handle !== "string" || typeof record.title !== "string") {
    return null;
  }
  const productNodes = asRecord(record.products)?.nodes;
  const products = Array.isArray(productNodes)
    ? productNodes.map(mapCollectionProduct).filter((p): p is StorefrontCollectionProduct => p !== null)
    : [];
  return {
    id: record.id,
    handle: record.handle,
    title: record.title,
    image: readImage(record.image),
    products,
  };
}

/**
 * Storefront GraphQL no servidor. Falha de rede ou token ausente → `null`
 * (o PDP continua com o título Dato).
 */
export async function getStorefrontProductByHandle(
  handle: string,
  locale: AppLocale,
): Promise<StorefrontProduct | null> {
  const shop = shopDomain();
  const token = readEnv("SHOPIFY_STOREFRONT_ACCESS_TOKEN");
  const trimmed = handle.trim();
  if (!shop || !token || !trimmed) return null;

  const url = `https://${shop}/api/${STOREFRONT_API_VERSION}/graphql.json`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...storefrontAuthHeaders(token),
      },
      body: JSON.stringify({
        query: PRODUCT_BY_HANDLE_QUERY,
        variables: { handle: trimmed, country: shopifyCountryFromLocale(locale) },
      }),
      next: catalogCache([shopifyProductTag(trimmed), SHOPIFY_PRODUCTS_TAG]),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { product?: unknown } };
    return mapProduct(json.data?.product);
  } catch {
    return null;
  }
}

export async function getStorefrontCollectionByHandle(
  handle: string,
  locale: AppLocale,
): Promise<StorefrontCollection | null> {
  const shop = shopDomain();
  const token = readEnv("SHOPIFY_STOREFRONT_ACCESS_TOKEN");
  const trimmed = handle.trim();
  if (!shop || !token || !trimmed) return null;

  const url = `https://${shop}/api/${STOREFRONT_API_VERSION}/graphql.json`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...storefrontAuthHeaders(token),
      },
      body: JSON.stringify({
        query: COLLECTION_BY_HANDLE_QUERY,
        variables: { handle: trimmed, country: shopifyCountryFromLocale(locale) },
      }),
      next: catalogCache([SHOPIFY_CATALOG_TAG]),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { collection?: unknown } };
    return mapCollection(json.data?.collection);
  } catch {
    return null;
  }
}

export async function getStorefrontCollectionMeta(
  handle: string,
  locale: AppLocale,
): Promise<StorefrontCollectionMeta | null> {
  const shop = shopDomain();
  const token = readEnv("SHOPIFY_STOREFRONT_ACCESS_TOKEN");
  const trimmed = handle.trim();
  if (!shop || !token || !trimmed) return null;

  const url = `https://${shop}/api/${STOREFRONT_API_VERSION}/graphql.json`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...storefrontAuthHeaders(token),
      },
      body: JSON.stringify({
        query: COLLECTION_META_QUERY,
        variables: { handle: trimmed, country: shopifyCountryFromLocale(locale) },
      }),
      next: catalogCache([SHOPIFY_CATALOG_TAG]),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { collection?: unknown } };
    const record = asRecord(json.data?.collection);
    if (!record || typeof record.handle !== "string" || typeof record.title !== "string") return null;
    return {
      handle: record.handle,
      title: record.title,
      image: readImage(record.image),
    };
  } catch {
    return null;
  }
}

export async function getStorefrontProducts(locale: AppLocale): Promise<StorefrontCollectionProduct[]> {
  const shop = shopDomain();
  const token = readEnv("SHOPIFY_STOREFRONT_ACCESS_TOKEN");
  if (!shop || !token) return [];

  const url = `https://${shop}/api/${STOREFRONT_API_VERSION}/graphql.json`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...storefrontAuthHeaders(token),
      },
      body: JSON.stringify({
        query: PRODUCTS_QUERY,
        variables: { country: shopifyCountryFromLocale(locale) },
      }),
      next: catalogCache([SHOPIFY_CATALOG_TAG]),
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: { products?: { nodes?: unknown } } };
    const nodes = json.data?.products?.nodes;
    if (!Array.isArray(nodes)) return [];
    return nodes
      .map(mapCollectionProduct)
      .filter((product): product is StorefrontCollectionProduct => product !== null);
  } catch {
    return [];
  }
}

export async function getStorefrontProductsByHandles(
  handles: string[],
  locale: AppLocale,
): Promise<StorefrontCollectionProduct[]> {
  const unique = [...new Set(handles.map((handle) => handle.trim()).filter(Boolean))];
  if (unique.length === 0) return [];
  const cards = await Promise.all(unique.map((handle) => getStorefrontProductByHandle(handle, locale)));
  const byHandle = new Map(
    cards
      .filter((product): product is StorefrontProduct => product !== null)
      .map((product) => [
        product.handle,
        {
          handle: product.handle,
          title: product.title,
          availableForSale: product.availableForSale,
          featuredImage: product.featuredImage,
          priceRange: product.priceRange,
        } satisfies StorefrontCollectionProduct,
      ]),
  );
  return unique.flatMap((handle) => {
    const card = byHandle.get(handle);
    return card ? [card] : [];
  });
}
