import { shopifyHtmlToPlainText } from "@/lib/shopify/product-description-html";

const PRODUCT_TOPICS = new Set(["products/create", "products/update"]);

export type ShopifyProductWebhook = {
  id: string;
  handle: string;
  title: string;
  /** Texto simples da descrição Shopify (`body_html`). Vazio se a Admin não tiver copy. */
  description: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

/** `products/create` ou `products/create;format=json`. */
export function normalizeShopifyTopic(header: string | null | undefined): string | null {
  const raw = header?.trim();
  if (!raw) return null;
  return raw.split(";")[0]?.trim() || null;
}

export function isProductWebhookTopic(topic: string | null): boolean {
  return topic !== null && PRODUCT_TOPICS.has(topic);
}

export function normalizeShopDomain(value: string | null | undefined): string {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
}

function readProductId(raw: unknown): string | null {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return String(Math.trunc(raw));
  }
  if (typeof raw === "string" && raw.trim()) {
    const trimmed = raw.trim();
    const gid = trimmed.match(/gid:\/\/shopify\/Product\/(\d+)/i);
    if (gid?.[1]) return gid[1];
    if (/^\d+$/.test(trimmed)) return trimmed;
  }
  return null;
}

export function parseShopifyProductWebhook(body: unknown): ShopifyProductWebhook | null {
  const record = asRecord(body);
  if (!record) return null;
  const id = readProductId(record.id);
  const handle = typeof record.handle === "string" ? record.handle.trim() : "";
  const title = typeof record.title === "string" ? record.title.trim() : "";
  if (!id || !handle) return null;
  const description = shopifyHtmlToPlainText(
    typeof record.body_html === "string" ? record.body_html : "",
  );
  return { id, handle, title: title || handle, description };
}
