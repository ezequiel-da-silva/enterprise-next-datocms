import {
  resolveWebhookItemTypeApiKey,
  type DatoWebhookBody,
} from "@/lib/datocms/revalidate-tags";
import { readDatoWebhookEventType } from "@/lib/datocms/parse-product-page-title-sync";

const COLLECTION_PAGE_API_KEY = "collection_page";
const TITLE_SYNC_EVENTS = new Set(["update", "publish", "item.update", "item.publish"]);

export type CollectionPageTitleSync = {
  shopifyCollectionId: string;
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

function readShopifyCollectionId(attrs: Record<string, unknown>): string | null {
  const raw = attrs.shopify_collection_id ?? attrs.shopifyCollectionId;
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return String(Math.trunc(raw));
  }
  if (typeof raw === "string" && raw.trim()) {
    const trimmed = raw.trim();
    const gid = trimmed.match(/gid:\/\/shopify\/Collection\/(\d+)/i);
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
  field: "title" | "description",
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

export function parseCollectionPageTitleSync(body: unknown): CollectionPageTitleSync | null {
  const eventType = readDatoWebhookEventType(body);
  if (eventType === null || !TITLE_SYNC_EVENTS.has(eventType)) return null;

  const webhook = (asRecord(body) ?? {}) as DatoWebhookBody;
  if (resolveWebhookItemTypeApiKey(webhook) !== COLLECTION_PAGE_API_KEY) return null;

  const attrs = asRecord(webhook.entity?.attributes);
  if (!attrs) return null;

  const shopifyCollectionId = readShopifyCollectionId(attrs);
  const titles = readLocalizedField(attrs, "title");
  const description = readLocalizedField(attrs, "description");
  if (!shopifyCollectionId || !titles.en) return null;

  return {
    shopifyCollectionId,
    titleEn: titles.en,
    titlePt: titles.pt,
    titleEs: titles.es,
    descriptionEn: description.en,
    descriptionPt: description.pt,
    descriptionEs: description.es,
  };
}
