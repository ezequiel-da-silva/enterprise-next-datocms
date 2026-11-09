import { syncCollectionPageFromShopify } from "@/infra/datocms/sync-collection-page";
import { syncProductPageFromShopify } from "@/infra/datocms/sync-product-page";
import { logError, logWarn } from "@/infra/observability/log-error";
import { productHandleForInventoryItem } from "@/infra/shopify/admin-inventory";
import { sendPurchaseMeasurementProtocol } from "@/lib/analytics/ecommerce";
import { SHOPIFY_CATALOG_TAG, SHOPIFY_PRODUCTS_TAG, shopifyProductTag } from "@/lib/shopify/cache-tags";
import { logMissingShopifyWebhookEnv } from "@/infra/shopify/log-missing-env";
import { readShopifyWebhookEnv } from "@/lib/shopify/env";
import { isShopifyHmacValid } from "@/lib/shopify/hmac";
import {
  isCollectionWebhookTopic,
  parseShopifyCollectionWebhook,
} from "@/lib/shopify/parse-collection-webhook";
import { isInventoryWebhookTopic, parseShopifyInventoryWebhook } from "@/lib/shopify/parse-inventory-webhook";
import {
  isOrderPaidWebhookTopic,
  parseShopifyOrderWebhook,
} from "@/lib/shopify/parse-order-webhook";
import {
  isProductWebhookTopic,
  normalizeShopDomain,
  normalizeShopifyTopic,
  parseShopifyProductWebhook,
} from "@/lib/shopify/parse-product-webhook";
import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function revalidateShopifyTags(tags: string[]): void {
  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 });
  }
}

function unauthorized(): NextResponse {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function missingEnvResponse(missing: string[]): NextResponse {
  logMissingShopifyWebhookEnv(missing);
  return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
}

/**
 * Shopify `products/*` e `collections/*` → upsert CMA de `product_page` / `collection_page`
 * + `revalidateTag` do cache Storefront. `inventory_levels/update` → só `revalidateTag`.
 * `orders/paid` → GA4 Measurement Protocol `purchase` (sem sync Dato).
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
    logWarn("webhook.shopify", "Rejected: invalid HMAC");
    return unauthorized();
  }

  const expectedShop = normalizeShopDomain(env.data.SHOPIFY_STORE_DOMAIN);
  const incomingShop = normalizeShopDomain(request.headers.get("x-shopify-shop-domain"));
  if (incomingShop !== expectedShop) {
    logWarn("webhook.shopify", "Rejected: shop domain mismatch");
    return unauthorized();
  }

  const topic = normalizeShopifyTopic(request.headers.get("x-shopify-topic"));
  const isProduct = isProductWebhookTopic(topic);
  const isCollection = isCollectionWebhookTopic(topic);
  const isInventory = isInventoryWebhookTopic(topic);
  const isOrderPaid = isOrderPaidWebhookTopic(topic);
  if (!isProduct && !isCollection && !isInventory && !isOrderPaid) {
    return unauthorized();
  }

  let parsed: unknown;
  try {
    parsed = rawBody.trim() ? JSON.parse(rawBody) : null;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (isOrderPaid) {
    const order = parseShopifyOrderWebhook(parsed);
    if (!order) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const mp = await sendPurchaseMeasurementProtocol({
      transaction_id: order.name,
      currency: order.currency,
      value: order.totalPrice,
      items: order.items,
    });
    if (!mp.ok) {
      logError("webhook.shopify.order", "GA4 Measurement Protocol failed", {
        context: { status: mp.status, order: order.name },
      });
      /* Still 200: Shopify retries would double-count if MP later succeeds. */
      return NextResponse.json({ success: true, purchase: "mp_error" });
    }
    if (mp.skipped) {
      logWarn("webhook.shopify.order", `GA4 purchase skipped (${mp.reason})`);
      return NextResponse.json({ success: true, purchase: "skipped" });
    }
    return NextResponse.json({ success: true, purchase: "sent" });
  }

  if (isInventory) {
    const inventory = parseShopifyInventoryWebhook(parsed);
    if (!inventory) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const handle = await productHandleForInventoryItem(inventory.inventoryItemId);
    /* 200 even when the lookup fails: a retry would not find the handle either, so drop every PDP instead. */
    revalidateShopifyTags([handle ? shopifyProductTag(handle) : SHOPIFY_PRODUCTS_TAG, SHOPIFY_CATALOG_TAG]);
    return NextResponse.json({ success: true, revalidated: handle ?? "all-products" });
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
      logError("webhook.shopify.collection", "Sync failed", {
        context: { reason: result.reason, handle: collection.handle },
      });
      return NextResponse.json({ error: "Sync failed" }, { status: 500 });
    }
    revalidateShopifyTags([SHOPIFY_CATALOG_TAG]);
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
    logError("webhook.shopify.product", "Sync failed", {
      context: { reason: result.reason, handle: product.handle },
    });
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }

  revalidateShopifyTags([shopifyProductTag(product.handle), SHOPIFY_CATALOG_TAG]);
  return NextResponse.json({ success: true });
}
