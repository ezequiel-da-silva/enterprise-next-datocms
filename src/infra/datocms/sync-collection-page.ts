import { buildClient, type Client } from "@datocms/cma-client-node";
import { readShopifyCollectionTranslations } from "@/infra/shopify/admin-collection-copy";
import { readDatoCmsEnvironment } from "@/lib/datocms/environment";
import type { ShopifyCollectionWebhook } from "@/lib/shopify/parse-collection-webhook";
import { shouldSkipShopifyCollectionHandle } from "@/lib/shopify/skip-collection-handle";

const COLLECTION_PAGE_API_KEY = "collection_page";

let cachedClient: Client | null = null;
let cachedItemTypeId: string | null = null;

function readCmaToken(): string | undefined {
  const raw = process.env.DATOCMS_USER_REVIEWS_CDA_TOKEN;
  return typeof raw === "string" && raw.trim() !== "" ? raw.trim() : undefined;
}

function getClient(): Client | null {
  const token = readCmaToken();
  if (!token) return null;
  if (!cachedClient) {
    cachedClient = buildClient({
      apiToken: token,
      environment: readDatoCmsEnvironment(),
    });
  }
  return cachedClient;
}

async function resolveCollectionPageItemTypeId(client: Client): Promise<string> {
  if (cachedItemTypeId) return cachedItemTypeId;
  const itemTypes = await client.itemTypes.list();
  const match = itemTypes.find((t) => t.api_key === COLLECTION_PAGE_API_KEY);
  if (!match?.id) {
    throw new Error(`DatoCMS item type "${COLLECTION_PAGE_API_KEY}" not found`);
  }
  cachedItemTypeId = match.id;
  return match.id;
}

function localizedCopy(value: string): Record<string, string> {
  return { en: value, "pt-BR": value, es: value };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function readLocalizedCopy(value: unknown): Record<string, string> {
  const nested = asRecord(value);
  if (!nested) return {};
  const out: Record<string, string> = {};
  for (const [key, entry] of Object.entries(nested)) {
    if (typeof entry === "string") out[key] = entry;
  }
  return out;
}

function patchLocalized(
  current: Record<string, string>,
  shopifyEn: string,
  translated: { pt: string | null; es: string | null },
): Record<string, string> | null {
  const patch: Record<string, string> = {};
  if (shopifyEn && shopifyEn !== (current.en ?? "").trim()) patch.en = shopifyEn;
  if (translated.pt && translated.pt !== (current["pt-BR"] ?? "").trim()) patch["pt-BR"] = translated.pt;
  if (translated.es && translated.es !== (current.es ?? "").trim()) patch.es = translated.es;
  if (Object.keys(patch).length === 0) return null;
  return { ...current, ...patch };
}

async function findByField(
  client: Client,
  itemTypeId: string,
  field: "shopify_collection_id" | "shopify_handle",
  value: string,
): Promise<{ id: string } | null> {
  const rows = await client.items.list({
    filter: {
      type: itemTypeId,
      fields: {
        [field]: { eq: value },
      },
    },
    page: { limit: 1 },
    version: "current",
  });
  return rows[0] ?? null;
}

export type SyncCollectionPageResult =
  | { ok: true; id: string; created: boolean }
  | { ok: true; skipped: true }
  | { ok: false; reason: "not_configured" | "transport_error" };

export async function syncCollectionPageFromShopify(
  collection: ShopifyCollectionWebhook,
): Promise<SyncCollectionPageResult> {
  if (shouldSkipShopifyCollectionHandle(collection.handle)) {
    return { ok: true, skipped: true };
  }

  const client = getClient();
  if (!client) {
    return { ok: false, reason: "not_configured" };
  }

  try {
    const itemTypeId = await resolveCollectionPageItemTypeId(client);
    const byId = await findByField(client, itemTypeId, "shopify_collection_id", collection.id);
    const existing =
      byId ?? (await findByField(client, itemTypeId, "shopify_handle", collection.handle));

    const keys = {
      shopify_handle: collection.handle,
      shopify_collection_id: collection.id,
    };

    let id: string;
    let created = false;
    if (existing?.id) {
      const current = await client.items.find(existing.id);
      const currentRecord = asRecord(current) ?? {};
      const i18n = await readShopifyCollectionTranslations(collection.id);
      const payload: Record<string, unknown> = { ...keys };
      const nextTitle = patchLocalized(
        readLocalizedCopy(currentRecord.title),
        collection.title.trim(),
        i18n.title,
      );
      if (nextTitle) payload.title = nextTitle;
      const nextDescription = patchLocalized(
        readLocalizedCopy(currentRecord.description),
        collection.description.trim(),
        i18n.description,
      );
      if (nextDescription) payload.description = nextDescription;
      await client.items.update(existing.id, payload);
      id = existing.id;
    } else {
      const createdItem = await client.items.create({
        item_type: { type: "item_type", id: itemTypeId },
        title: localizedCopy(collection.title),
        ...(collection.description.trim()
          ? { description: localizedCopy(collection.description.trim()) }
          : {}),
        ...keys,
      });
      id = createdItem.id;
      created = true;
    }

    await client.items.publish(id);
    return { ok: true, id, created };
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[syncCollectionPageFromShopify] CMA upsert failed", err);
    } else {
      console.error("[syncCollectionPageFromShopify] CMA upsert failed");
    }
    return { ok: false, reason: "transport_error" };
  }
}

export function resetCollectionPageCmaCacheForTests(): void {
  cachedClient = null;
  cachedItemTypeId = null;
}
