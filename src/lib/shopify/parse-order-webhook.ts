import type { Ga4Item } from "@/lib/analytics/ecommerce";

const ORDER_PAID_TOPICS = new Set(["orders/paid"]);

export type ShopifyOrderWebhook = {
  /** Numeric Shopify order id (string). */
  id: string;
  /** Display name, e.g. `#1001`. */
  name: string;
  currency: string;
  totalPrice: number;
  items: Ga4Item[];
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function readId(raw: unknown): string | null {
  if (typeof raw === "number" && Number.isFinite(raw)) return String(Math.trunc(raw));
  if (typeof raw === "string" && raw.trim()) {
    const trimmed = raw.trim();
    const gid = trimmed.match(/gid:\/\/shopify\/Order\/(\d+)/i);
    if (gid?.[1]) return gid[1];
    if (/^\d+$/.test(trimmed)) return trimmed;
  }
  return null;
}

function readMoney(raw: unknown): number {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string" && raw.trim()) {
    const value = Number(raw.trim());
    return Number.isFinite(value) ? value : 0;
  }
  return 0;
}

function readQuantity(raw: unknown): number {
  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) return Math.trunc(raw);
  if (typeof raw === "string" && /^\d+$/.test(raw.trim())) {
    const value = Number(raw.trim());
    return value > 0 ? value : 1;
  }
  return 1;
}

export function isOrderPaidWebhookTopic(topic: string | null): boolean {
  return topic !== null && ORDER_PAID_TOPICS.has(topic);
}

/** Sanitize order name for display in `?order=` (no HTML / control chars). */
export function sanitizeOrderDisplayName(raw: string | null | undefined): string | null {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) return null;
  const cleaned = trimmed.replace(/[^\w#.\-/\s]/gu, "").trim().slice(0, 40);
  return cleaned || null;
}

export function parseShopifyOrderWebhook(body: unknown): ShopifyOrderWebhook | null {
  const record = asRecord(body);
  if (!record) return null;
  const id = readId(record.id);
  const name = typeof record.name === "string" ? record.name.trim() : "";
  if (!id || !name) return null;

  const currency =
    (typeof record.currency === "string" && record.currency.trim()) ||
    (typeof record.presentment_currency === "string" && record.presentment_currency.trim()) ||
    "USD";
  const totalPrice = readMoney(record.total_price ?? record.current_total_price);

  const lineItems = Array.isArray(record.line_items) ? record.line_items : [];
  const items: Ga4Item[] = [];
  for (const entry of lineItems) {
    const line = asRecord(entry);
    if (!line) continue;
    const title = typeof line.title === "string" ? line.title.trim() : "";
    if (!title) continue;
    const sku = typeof line.sku === "string" ? line.sku.trim() : "";
    const productId = readId(line.product_id);
    const variantTitle = typeof line.variant_title === "string" ? line.variant_title.trim() : "";
    items.push({
      item_id: sku || productId || title,
      item_name: title,
      price: readMoney(line.price),
      quantity: readQuantity(line.quantity),
      item_variant: variantTitle && variantTitle !== "Default Title" ? variantTitle : undefined,
    });
  }

  return { id, name, currency, totalPrice, items };
}
