const STOREFRONT_API_VERSION = "2024-07";

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

export type StorefrontVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
  price: StorefrontMoney;
};

export type StorefrontProduct = {
  id: string;
  title: string;
  handle: string;
  availableForSale: boolean;
  featuredImage: StorefrontProductImage | null;
  priceRange: { minVariantPrice: StorefrontMoney };
  variants: StorefrontVariant[];
};

const PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
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
      variants(first: 50) {
        nodes {
          id
          title
          availableForSale
          quantityAvailable
          price {
            amount
            currencyCode
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

/** Headless private tokens (`shpat_`) use a different header than the public hex token. */
export function storefrontAuthHeaders(token: string): Record<string, string> {
  if (token.startsWith("shpat_")) {
    return { "Shopify-Storefront-Private-Token": token };
  }
  return { "X-Shopify-Storefront-Access-Token": token };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function readMoney(value: unknown): StorefrontMoney | null {
  const record = asRecord(value);
  if (!record) return null;
  const amount = typeof record.amount === "string" ? record.amount : null;
  const currencyCode = typeof record.currencyCode === "string" ? record.currencyCode : null;
  if (!amount || !currencyCode) return null;
  return { amount, currencyCode };
}

function readImage(value: unknown): StorefrontProductImage | null {
  const record = asRecord(value);
  if (!record || typeof record.url !== "string" || !record.url.trim()) return null;
  return {
    url: record.url.trim(),
    altText: typeof record.altText === "string" ? record.altText : null,
    width: typeof record.width === "number" ? record.width : null,
    height: typeof record.height === "number" ? record.height : null,
  };
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
  };
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
    availableForSale: record.availableForSale === true,
    featuredImage: readImage(record.featuredImage),
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

const COLLECTION_BY_HANDLE_QUERY = /* GraphQL */ `
  query CollectionByHandle($handle: String!) {
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
        }
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
export async function getStorefrontProductByHandle(handle: string): Promise<StorefrontProduct | null> {
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
      body: JSON.stringify({ query: PRODUCT_BY_HANDLE_QUERY, variables: { handle: trimmed } }),
      cache: "no-store",
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
      body: JSON.stringify({ query: COLLECTION_BY_HANDLE_QUERY, variables: { handle: trimmed } }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { collection?: unknown } };
    return mapCollection(json.data?.collection);
  } catch {
    return null;
  }
}
