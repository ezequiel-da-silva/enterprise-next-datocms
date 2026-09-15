import {
  resolveWebhookItemTypeApiKey,
  type DatoWebhookBody,
} from "@/lib/datocms/revalidate-tags";

const PRODUCT_PAGE_API_KEY = "product_page";
const TITLE_SYNC_EVENTS = new Set(["update", "publish", "item.update", "item.publish"]);

export type ProductPageTitleSync = {
  shopifyProductId: string;
  titleEn: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

export function readDatoWebhookEventType(body: unknown): string | null {
  const record = asRecord(body);
  if (!record) return null;
  const event = record.event_type;
  return typeof event === "string" && event.trim() ? event.trim() : null;
}

function readShopifyProductId(attrs: Record<string, unknown>): string | null {
  const raw = attrs.shopify_product_id ?? attrs.shopifyProductId;
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return String(Math.trunc(raw));
  }
  if (typeof raw === "string" && raw.trim()) {
    const trimmed = raw.trim();
    const gid = trimmed.match(/gid:\/\/shopify\/Product\/(\d+)/i);
    if (gid?.[1]) return gid[1];
    return trimmed;
  }
  return null;
}

/** Título Shopify = locale `en` do Dato (o produto Shopify não é localizado). */
export function readTitleEn(attrs: Record<string, unknown>): string | null {
  const raw = attrs.title;
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  const nested = asRecord(raw);
  if (!nested) return null;
  for (const key of ["en", "en-US"] as const) {
    const value = nested[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

export function isProductPageTitleSyncEvent(eventType: string | null): boolean {
  return eventType !== null && TITLE_SYNC_EVENTS.has(eventType);
}

/**
 * Payload Dato `item` `product_page` (publish/update) → id Shopify + título `en`.
 * Outros modelos, eventos ou campos em falta → `null` (a rota responde 200 skip).
 */
export function parseProductPageTitleSync(body: unknown): ProductPageTitleSync | null {
  const eventType = readDatoWebhookEventType(body);
  if (!isProductPageTitleSyncEvent(eventType)) return null;

  const webhook = (asRecord(body) ?? {}) as DatoWebhookBody;
  if (resolveWebhookItemTypeApiKey(webhook) !== PRODUCT_PAGE_API_KEY) return null;

  const attrs = asRecord(webhook.entity?.attributes);
  if (!attrs) return null;

  const shopifyProductId = readShopifyProductId(attrs);
  const titleEn = readTitleEn(attrs);
  if (!shopifyProductId || !titleEn) return null;

  return { shopifyProductId, titleEn };
}
