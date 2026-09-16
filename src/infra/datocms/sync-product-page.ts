import { buildClient, type Client } from "@datocms/cma-client-node";
import { readShopifyProductTranslations } from "@/infra/shopify/admin-product-title";
import { readDatoCmsEnvironment } from "@/lib/datocms/environment";
import type { ShopifyProductWebhook } from "@/lib/shopify/parse-product-webhook";

const PRODUCT_PAGE_API_KEY = "product_page";

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

async function resolveProductPageItemTypeId(client: Client): Promise<string> {
  if (cachedItemTypeId) return cachedItemTypeId;
  const itemTypes = await client.itemTypes.list();
  const match = itemTypes.find((t) => t.api_key === PRODUCT_PAGE_API_KEY);
  if (!match?.id) {
    throw new Error(`DatoCMS item type "${PRODUCT_PAGE_API_KEY}" not found`);
  }
  cachedItemTypeId = match.id;
  return match.id;
}

/** CMA REST neste projecto usa `pt-BR`; o CDA GraphQL continua `pt_BR`. */
function localizedCopy(value: string): Record<string, string> {
  return { en: value, "pt-BR": value, es: value };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

/**
 * Mantém os locales vazios: omitir uma chave existente faz a CMA ler o update
 * como remoção de tradução (`INVALID_LOCALES`) e rejeitar o registo inteiro.
 */
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
  field: "shopify_product_id" | "shopify_handle",
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

export type SyncProductPageResult =
  | { ok: true; id: string; created: boolean }
  | { ok: false; reason: "not_configured" | "transport_error" };

/**
 * Upsert + publish de `product_page` a partir do webhook Shopify.
 * Create: `title` e `description` nos 3 locales = copy EN da Shopify.
 * Update: handle + id; `title.en` / `description.en` só se mudou; `pt-BR`/`es` só se a
 * Translations API trouxer valor diferente.
 */
export async function syncProductPageFromShopify(
  product: ShopifyProductWebhook,
): Promise<SyncProductPageResult> {
  const client = getClient();
  if (!client) {
    return { ok: false, reason: "not_configured" };
  }

  try {
    const itemTypeId = await resolveProductPageItemTypeId(client);
    const byId = await findByField(client, itemTypeId, "shopify_product_id", product.id);
    const existing =
      byId ?? (await findByField(client, itemTypeId, "shopify_handle", product.handle));

    const keys = {
      shopify_handle: product.handle,
      shopify_product_id: product.id,
    };

    let id: string;
    let created = false;
    if (existing?.id) {
      const current = await client.items.find(existing.id);
      const currentRecord = asRecord(current) ?? {};
      const i18n = await readShopifyProductTranslations(product.id);
      const payload: Record<string, unknown> = { ...keys };
      const nextTitle = patchLocalized(readLocalizedCopy(currentRecord.title), product.title.trim(), i18n.title);
      if (nextTitle) payload.title = nextTitle;
      const nextDescription = patchLocalized(
        readLocalizedCopy(currentRecord.description ?? currentRecord.lead),
        product.description.trim(),
        i18n.description,
      );
      if (nextDescription) payload.description = nextDescription;
      await client.items.update(existing.id, payload);
      id = existing.id;
    } else {
      const createdItem = await client.items.create({
        item_type: { type: "item_type", id: itemTypeId },
        title: localizedCopy(product.title),
        ...(product.description.trim()
          ? { description: localizedCopy(product.description.trim()) }
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
      console.error("[syncProductPageFromShopify] CMA upsert failed", err);
    } else {
      console.error("[syncProductPageFromShopify] CMA upsert failed");
    }
    return { ok: false, reason: "transport_error" };
  }
}

/** Só testes — limpa o cliente em memória entre casos. */
export function resetProductPageCmaCacheForTests(): void {
  cachedClient = null;
  cachedItemTypeId = null;
}
