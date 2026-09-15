import { buildClient, type Client } from "@datocms/cma-client-node";
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
function localizedTitle(title: string): Record<string, string> {
  return { en: title, "pt-BR": title, es: title };
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
 * Create: preenche `title` nos 3 locales. Update: só handle + id (título editorial no Dato).
 * Token: `DATOCMS_USER_REVIEWS_CDA_TOKEN` (CMA). Ambiente: `DATOCMS_ENVIRONMENT`
 * (`develop` para o sandbox; se faltar, primary `main`).
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
      // Update: identificadores Shopify. Não tocar em `title` (editorial no Dato).
      await client.items.update(existing.id, keys);
      id = existing.id;
    } else {
      const createdItem = await client.items.create({
        item_type: { type: "item_type", id: itemTypeId },
        title: localizedTitle(product.title),
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
