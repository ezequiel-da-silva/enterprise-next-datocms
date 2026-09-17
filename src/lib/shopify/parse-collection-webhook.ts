import { shopifyHtmlToPlainText } from "@/lib/shopify/product-description-html";
import { normalizeShopifyTopic } from "@/lib/shopify/parse-product-webhook";

const COLLECTION_TOPICS = new Set(["collections/create", "collections/update"]);

export type ShopifyCollectionWebhook = {
  id: string;
  handle: string;
  title: string;
  description: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

export function isCollectionWebhookTopic(topic: string | null): boolean {
  return topic !== null && COLLECTION_TOPICS.has(topic);
}

function readCollectionId(raw: unknown): string | null {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return String(Math.trunc(raw));
  }
  if (typeof raw === "string" && raw.trim()) {
    const trimmed = raw.trim();
    const gid = trimmed.match(/gid:\/\/shopify\/Collection\/(\d+)/i);
    if (gid?.[1]) return gid[1];
    if (/^\d+$/.test(trimmed)) return trimmed;
  }
  return null;
}

export function parseShopifyCollectionWebhook(body: unknown): ShopifyCollectionWebhook | null {
  const record = asRecord(body);
  if (!record) return null;
  const id = readCollectionId(record.id);
  const handle = typeof record.handle === "string" ? record.handle.trim() : "";
  const title = typeof record.title === "string" ? record.title.trim() : "";
  if (!id || !handle) return null;
  const description = shopifyHtmlToPlainText(
    typeof record.body_html === "string" ? record.body_html : "",
  );
  return { id, handle, title: title || handle, description };
}

export { normalizeShopifyTopic };
