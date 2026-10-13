const INVENTORY_TOPICS = new Set(["inventory_levels/update"]);

export type ShopifyInventoryWebhook = {
  /** Numeric `InventoryItem` id (the payload has no product id or handle). */
  inventoryItemId: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

export function isInventoryWebhookTopic(topic: string | null): boolean {
  return topic !== null && INVENTORY_TOPICS.has(topic);
}

function readInventoryItemId(raw: unknown): string | null {
  if (typeof raw === "number" && Number.isSafeInteger(raw) && raw > 0) {
    return String(raw);
  }
  if (typeof raw === "string" && raw.trim()) {
    const trimmed = raw.trim();
    const gid = trimmed.match(/^gid:\/\/shopify\/InventoryItem\/(\d+)$/i);
    if (gid?.[1]) return gid[1];
    if (/^\d+$/.test(trimmed)) return trimmed;
  }
  return null;
}

export function parseShopifyInventoryWebhook(body: unknown): ShopifyInventoryWebhook | null {
  const id = readInventoryItemId(asRecord(body)?.inventory_item_id);
  return id ? { inventoryItemId: id } : null;
}
