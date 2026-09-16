import {
  resolveWebhookItemTypeApiKey,
  type DatoWebhookBody,
} from "@/lib/datocms/revalidate-tags";

const PRODUCT_PAGE_API_KEY = "product_page";
const TITLE_SYNC_EVENTS = new Set(["update", "publish", "item.update", "item.publish"]);

export type ProductPageTitleSync = {
  shopifyProductId: string;
  titleEn: string;
  titlePt: string | null;
  titleEs: string | null;
  descriptionEn: string | null;
  descriptionPt: string | null;
  descriptionEs: string | null;
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

function readLocaleTitle(nested: Record<string, unknown>, keys: readonly string[]): string | null {
  for (const key of keys) {
    const value = nested[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function readLocalizedField(
  attrs: Record<string, unknown>,
  field: "title" | "description" | "lead",
): {
  en: string | null;
  pt: string | null;
  es: string | null;
} {
  const raw = attrs[field];
  if (typeof raw === "string" && raw.trim()) {
    return { en: raw.trim(), pt: null, es: null };
  }
  const nested = asRecord(raw) ?? {};
  return {
    en: readLocaleTitle(nested, ["en", "en-US"]),
    pt: readLocaleTitle(nested, ["pt-BR", "pt_BR", "pt"]),
    es: readLocaleTitle(nested, ["es", "es-ES"]),
  };
}

/** Título Shopify default = locale `en` do Dato. */
export function readTitleEn(attrs: Record<string, unknown>): string | null {
  return readLocalizedField(attrs, "title").en;
}

export function readLocalizedTitles(attrs: Record<string, unknown>): {
  en: string | null;
  pt: string | null;
  es: string | null;
} {
  return readLocalizedField(attrs, "title");
}

export function isProductPageTitleSyncEvent(eventType: string | null): boolean {
  return eventType !== null && TITLE_SYNC_EVENTS.has(eventType);
}

/**
 * Payload Dato `item` `product_page` (publish/update) → id Shopify + título + descrição.
 * Outros modelos, eventos ou `en` em falta → `null` (a rota responde 200 skip).
 */
export function parseProductPageTitleSync(body: unknown): ProductPageTitleSync | null {
  const eventType = readDatoWebhookEventType(body);
  if (!isProductPageTitleSyncEvent(eventType)) return null;

  const webhook = (asRecord(body) ?? {}) as DatoWebhookBody;
  if (resolveWebhookItemTypeApiKey(webhook) !== PRODUCT_PAGE_API_KEY) return null;

  const attrs = asRecord(webhook.entity?.attributes);
  if (!attrs) return null;

  const shopifyProductId = readShopifyProductId(attrs);
  const titles = readLocalizedField(attrs, "title");
  const description = readLocalizedField(attrs, "description");
  const leadFallback = readLocalizedField(attrs, "lead");
  if (!shopifyProductId || !titles.en) return null;

  return {
    shopifyProductId,
    titleEn: titles.en,
    titlePt: titles.pt,
    titleEs: titles.es,
    descriptionEn: description.en ?? leadFallback.en,
    descriptionPt: description.pt ?? leadFallback.pt,
    descriptionEs: description.es ?? leadFallback.es,
  };
}
