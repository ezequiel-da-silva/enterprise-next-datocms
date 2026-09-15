import { logMissingShopifyAdminEnv, readShopifyAdminEnv } from "@/lib/shopify/admin-env";

/** Alinhado com `shopify.app.toml` `[webhooks] api_version`. */
export const SHOPIFY_ADMIN_API_VERSION = "2026-07";

export type PushProductTitleResult =
  | { ok: true; skipped: boolean }
  | { ok: false; reason: "not_configured" | "transport_error" | "shopify_error" };

function productGid(id: string): string {
  if (id.startsWith("gid://shopify/Product/")) return id;
  return `gid://shopify/Product/${id}`;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

type AdminGraphqlResult = {
  ok: boolean;
  json: unknown;
};

async function adminGraphql(
  domain: string,
  token: string,
  query: string,
  variables: Record<string, unknown>,
): Promise<AdminGraphqlResult> {
  const response = await fetch(`https://${domain}/admin/api/${SHOPIFY_ADMIN_API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json: unknown = await response.json().catch(() => null);
  return { ok: response.ok, json };
}

const PRODUCT_TITLE_QUERY = /* GraphQL */ `
  query ProductTitle($id: ID!) {
    product(id: $id) {
      id
      title
    }
  }
`;

const PRODUCT_UPDATE_MUTATION = /* GraphQL */ `
  mutation ProductUpdateTitle($product: ProductUpdateInput!) {
    productUpdate(product: $product) {
      product {
        id
        title
      }
      userErrors {
        field
        message
      }
    }
  }
`;

function logAdminFailure(message: string, detail?: unknown): void {
  if (process.env.NODE_ENV !== "production" && detail) {
    console.error(message, detail);
    return;
  }
  console.error(message);
}

/**
 * Empurra `title` (`en` no Dato) para o produto Shopify.
 * No-op se o título na Admin já for igual (evita eco `products/update`).
 */
export async function pushShopifyProductTitle(
  shopifyProductId: string,
  titleEn: string,
): Promise<PushProductTitleResult> {
  const env = readShopifyAdminEnv();
  if (!env.ok) {
    logMissingShopifyAdminEnv(env.missing);
    return { ok: false, reason: "not_configured" };
  }

  const id = productGid(shopifyProductId);
  const title = titleEn.trim();
  if (!title) return { ok: false, reason: "shopify_error" };

  try {
    const read = await adminGraphql(env.data.SHOPIFY_STORE_DOMAIN, env.data.SHOPIFY_ADMIN_ACCESS_TOKEN, PRODUCT_TITLE_QUERY, {
      id,
    });
    const product = asRecord(asRecord(asRecord(read.json)?.data)?.product);
    const current = typeof product?.title === "string" ? product.title.trim() : "";
    if (read.ok && current === title) {
      return { ok: true, skipped: true };
    }

    const write = await adminGraphql(
      env.data.SHOPIFY_STORE_DOMAIN,
      env.data.SHOPIFY_ADMIN_ACCESS_TOKEN,
      PRODUCT_UPDATE_MUTATION,
      { product: { id, title } },
    );
    const payload = asRecord(asRecord(asRecord(write.json)?.data)?.productUpdate);
    const errors = payload?.userErrors;
    if (
      !write.ok ||
      (Array.isArray(errors) && errors.length > 0) ||
      !asRecord(payload?.product)
    ) {
      logAdminFailure("[pushShopifyProductTitle] productUpdate failed", write.json);
      return { ok: false, reason: "shopify_error" };
    }
    return { ok: true, skipped: false };
  } catch (err) {
    logAdminFailure("[pushShopifyProductTitle] Admin GraphQL failed", err);
    return { ok: false, reason: "transport_error" };
  }
}
