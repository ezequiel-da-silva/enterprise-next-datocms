import { syncCollectionPageFromShopify } from "@/infra/datocms/sync-collection-page";
import { syncProductPageFromShopify } from "@/infra/datocms/sync-product-page";
import { logMissingShopifyWebhookEnv, readShopifyWebhookEnv } from "@/lib/shopify/env";
import { isShopifyHmacValid } from "@/lib/shopify/hmac";
import {
  isCollectionWebhookTopic,
  parseShopifyCollectionWebhook,
} from "@/lib/shopify/parse-collection-webhook";
import {
  isProductWebhookTopic,
  normalizeShopDomain,
  normalizeShopifyTopic,
  parseShopifyProductWebhook,
} from "@/lib/shopify/parse-product-webhook";
import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function unauthorized(): NextResponse {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function missingEnvResponse(missing: string[]): NextResponse {
  logMissingShopifyWebhookEnv(missing);
  return NextResponse.json(
    { error: "Webhook not configured", missing },
    { status: 500 },
  );
}

/**
 * Shopify `products/*` e `collections/*` → upsert CMA de `product_page` / `collection_page`.
 * HMAC no corpo cru (`x-shopify-hmac-sha256`) com `SHOPIFY_API_SECRET_KEY`
 * (chave secreta do Dev Dashboard; o client id não entra no HMAC).
 */
export async function POST(request: NextRequest) {
  const env = readShopifyWebhookEnv();
  if (!env.ok) {
    return missingEnvResponse(env.missing);
  }

  const rawBody = await request.text();
  if (
    !isShopifyHmacValid(
      rawBody,
      request.headers.get("x-shopify-hmac-sha256"),
      env.data.SHOPIFY_API_SECRET_KEY,
    )
  ) {
    return unauthorized();
  }

  const expectedShop = normalizeShopDomain(env.data.SHOPIFY_STORE_DOMAIN);
  const incomingShop = normalizeShopDomain(request.headers.get("x-shopify-shop-domain"));
  if (incomingShop !== expectedShop) {
    return unauthorized();
  }

  const topic = normalizeShopifyTopic(request.headers.get("x-shopify-topic"));
  const isProduct = isProductWebhookTopic(topic);
  const isCollection = isCollectionWebhookTopic(topic);
  if (!isProduct && !isCollection) {
    return unauthorized();
  }

  let parsed: unknown;
  try {
    parsed = rawBody.trim() ? JSON.parse(rawBody) : null;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (isCollection) {
    const collection = parseShopifyCollectionWebhook(parsed);
    if (!collection) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const result = await syncCollectionPageFromShopify(collection);
    if (!result.ok) {
      if (result.reason === "not_configured") {
        return missingEnvResponse(["DATOCMS_USER_REVIEWS_CDA_TOKEN"]);
      }
      return NextResponse.json({ error: "Sync failed" }, { status: 500 });
    }
    if ("skipped" in result && result.skipped) {
      return NextResponse.json({ success: true, skipped: true });
    }
    return NextResponse.json({ success: true });
  }

  const product = parseShopifyProductWebhook(parsed);
  if (!product) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const result = await syncProductPageFromShopify(product);
  if (!result.ok) {
    if (result.reason === "not_configured") {
      return missingEnvResponse(["DATOCMS_USER_REVIEWS_CDA_TOKEN"]);
    }
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
