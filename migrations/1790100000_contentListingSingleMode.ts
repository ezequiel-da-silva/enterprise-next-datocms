import { buildBlockRecord } from "@datocms/cma-client-node";
import { Client } from "datocms/lib/cma-client-node";

const FIELD_DEPENDENCIES_PLUGIN_ID = "eFlp-ENNSyyi9oDVYogO0w";

type ListingMode =
  | "blog_auto_all"
  | "blog_auto_selected"
  | "blog_auto_none"
  | "blog_manual"
  | "shopify_auto_all"
  | "shopify_auto_collection"
  | "shopify_manual";

const LISTING_MODES = new Set<ListingMode>([
  "blog_auto_all",
  "blog_auto_selected",
  "blog_auto_none",
  "blog_manual",
  "shopify_auto_all",
  "shopify_auto_collection",
  "shopify_manual",
]);

type NestedBlock = {
  id: string;
  __itemTypeId?: string;
  attributes?: Record<string, unknown>;
  relationships?: { item_type?: { data?: { id?: string } } };
};

async function findField(client: Client, pointer: string) {
  try {
    return await client.fields.find(pointer);
  } catch {
    return null;
  }
}

function normalized(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function isShopify(value: unknown): boolean {
  return normalized(value).includes("shop");
}

function isManual(value: unknown): boolean {
  const raw = normalized(value);
  return raw.includes("manual") || raw.includes("curad");
}

function categoryFilter(value: unknown): "all" | "selected" | "none" {
  const raw = normalized(value).replace(/[\s-]+/g, "_");
  if (raw.includes("none") || raw.includes("nenhum") || raw.includes("ocult")) return "none";
  if (raw.includes("selected") || raw.includes("selecion") || raw.includes("escolhid")) {
    return "selected";
  }
  return "all";
}

function listingMode(record: Record<string, unknown>): ListingMode {
  const current = normalized(record.listing_mode);
  if (LISTING_MODES.has(current as ListingMode)) return current as ListingMode;
  const shopify = isShopify(record.content_source ?? record.listing_mode);
  const manual = isManual(record.fetch_mode);
  if (shopify) {
    if (manual) return "shopify_manual";
    return categoryFilter(record.category_display) === "selected"
      ? "shopify_auto_collection"
      : "shopify_auto_all";
  }
  if (manual) return "blog_manual";
  const filter = categoryFilter(record.category_display);
  if (filter === "selected") return "blog_auto_selected";
  if (filter === "none") return "blog_auto_none";
  return "blog_auto_all";
}

function itemTypeId(block: NestedBlock): string | undefined {
  return block.__itemTypeId ?? block.relationships?.item_type?.data?.id;
}

const OPTIONS: Array<{ label: string; value: ListingMode; hint: string }> = [
  {
    label: "Blog — automático, todas as categorias",
    value: "blog_auto_all",
    hint: "Lista posts publicados e mostra todas as categorias disponíveis.",
  },
  {
    label: "Blog — automático, categorias selecionadas",
    value: "blog_auto_selected",
    hint: "Lista posts publicados apenas das categorias escolhidas.",
  },
  {
    label: "Blog — automático, sem filtro",
    value: "blog_auto_none",
    hint: "Lista posts publicados sem pílulas de categoria.",
  },
  {
    label: "Blog — seleção manual",
    value: "blog_manual",
    hint: "Mostra os posts escolhidos manualmente e na ordem editorial.",
  },
  {
    label: "Shopify — todos os produtos",
    value: "shopify_auto_all",
    hint: "Lista todos os produtos publicados que têm product_page.",
  },
  {
    label: "Shopify — coleção selecionada",
    value: "shopify_auto_collection",
    hint: "Lista os produtos de uma collection_page selecionada.",
  },
  {
    label: "Shopify — seleção manual",
    value: "shopify_manual",
    hint: "Mostra os product_page escolhidos manualmente e na ordem editorial.",
  },
];

const DEPENDENCIES: Record<ListingMode, string[]> = {
  blog_auto_all: ["all_categories_label", "show_sort_tabs"],
  blog_auto_selected: ["all_categories_label", "selected_categories", "show_sort_tabs"],
  blog_auto_none: ["show_sort_tabs"],
  blog_manual: ["manual_posts"],
  shopify_auto_all: [],
  shopify_auto_collection: ["source_collection"],
  shopify_manual: ["selected_products"],
};

/**
 * Substitui três dropdowns concorrentes por um único controlador. O plugin
 * Field Dependencies não suporta AND entre campos, portanto cada opção
 * representa fonte + aquisição + filtro e controla alvos exclusivos.
 */
export default async function contentListingSingleMode(client: Client): Promise<void> {
  const blockType = await client.itemTypes.find("content_listing_section");
  await client.itemTypes.update(blockType.id, {
    hint: "Lista Blog ou Shopify. Listing mode define a fonte, aquisição automática/manual e filtro.",
  });
  const contentSource =
    (await findField(client, "content_listing_section::listing_mode")) ??
    (await client.fields.find("content_listing_section::content_source"));
  const fetchMode = await findField(client, "content_listing_section::fetch_mode");
  const categoryDisplay = await findField(client, "content_listing_section::category_display");

  await client.fields.update(contentSource.id, {
    label: "Listing mode",
    api_key: "listing_mode",
    hint: "Escolha a fonte, a aquisição automática/manual e o filtro da listagem.",
    default_value: "blog_auto_all",
    appearance: {
      editor: "string_select",
      parameters: { options: OPTIONS },
      addons: [
        {
          id: FIELD_DEPENDENCIES_PLUGIN_ID,
          parameters: { dependencies: JSON.stringify(DEPENDENCIES) },
        },
      ],
    },
  });

  let offset = 0;
  while (true) {
    const pages = await client.items.list({
      filter: { type: "page" },
      page: { limit: 30, offset },
      version: "current",
      nested: true,
    });
    for (const page of pages) {
      const contentPage = (page as { content_page?: unknown }).content_page;
      if (!contentPage || typeof contentPage !== "object" || Array.isArray(contentPage)) continue;
      let changed = false;
      const nextContent = Object.fromEntries(
        Object.entries(contentPage as Record<string, unknown>).map(([locale, rawBlocks]) => {
          if (!Array.isArray(rawBlocks)) return [locale, rawBlocks];
          const blocks = rawBlocks as NestedBlock[];
          const nextBlocks = blocks.map((block) => {
            if (itemTypeId(block) !== blockType.id) return block.id;
            changed = true;
            return buildBlockRecord({
              id: block.id,
              listing_mode: listingMode(block.attributes ?? {}),
            });
          });
          return [locale, nextBlocks];
        }),
      );
      if (changed) {
        const wasPublished = (page.meta as { status?: string }).status === "published";
        await client.items.update(page.id, { content_page: nextContent } as never);
        if (wasPublished) await client.items.publish(page.id);
      }
    }
    if (pages.length < 30) break;
    offset += pages.length;
  }

  const sourceCollection = await client.fields.find("content_listing_section::source_collection");
  await client.fields.update(sourceCollection.id, {
    label: "Source collection",
    hint: "Shopify — coleção selecionada. Os produtos continuam vindo da Storefront.",
  });

  if (fetchMode) await client.fields.destroy(fetchMode.id);
  if (categoryDisplay) await client.fields.destroy(categoryDisplay.id);
}
