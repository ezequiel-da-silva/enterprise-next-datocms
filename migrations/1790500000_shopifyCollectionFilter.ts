import { buildBlockRecord } from "@datocms/cma-client-node";
import { Client } from "datocms/lib/cma-client-node";

const FIELD_DEPENDENCIES_PLUGIN_ID = "eFlp-ENNSyyi9oDVYogO0w";

type NestedBlock = {
  id: string;
  __itemTypeId?: string;
  attributes?: Record<string, unknown>;
  relationships?: { item_type?: { data?: { id?: string } } };
};

function itemTypeId(block: NestedBlock): string | undefined {
  return block.__itemTypeId ?? block.relationships?.item_type?.data?.id;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function hasCollection(value: unknown): boolean {
  if (value == null || value === "") return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return isRecord(value);
}

function listingConfigBlock(attributes: Record<string, unknown>): NestedBlock | null {
  const raw = attributes.listing_config;
  if (Array.isArray(raw) && isRecord(raw[0])) return raw[0] as NestedBlock;
  if (isRecord(raw) && typeof (raw as NestedBlock).id === "string") return raw as NestedBlock;
  return null;
}

export default async function shopifyCollectionFilter(client: Client): Promise<void> {
  console.log("Adding Shopify collection filter...");

  const shopifyConfig = await client.itemTypes.find("shopify_listing_config");
  const listingSection = await client.itemTypes.find("content_listing_section");
  const fetchMode = await client.fields.find("shopify_listing_config::fetch_mode");
  const sourceCollection = await client.fields.find("shopify_listing_config::source_collection");

  const collectionFilterPayload = {
    label: "Collection filter",
    hint: "All published products, or products from one selected collection.",
    field_type: "string" as const,
    localized: false as const,
    default_value: "all",
    validators: {},
    appearance: {
      editor: "string_select" as const,
      parameters: {
        options: [
          {
            label: "All published products",
            value: "all",
            hint: "List every Storefront product that has a published product page.",
          },
          {
            label: "Selected collection",
            value: "selected",
            hint: "List products from the collection chosen below.",
          },
        ],
      },
      addons: [
        {
          id: FIELD_DEPENDENCIES_PLUGIN_ID,
          parameters: {
            dependencies: JSON.stringify({
              all: [],
              selected: ["source_collection"],
            }),
          },
        },
      ],
    },
  };

  let collectionFilter;
  try {
    collectionFilter = await client.fields.find("shopify_listing_config::collection_filter");
    await client.fields.update(collectionFilter.id, collectionFilterPayload);
  } catch {
    collectionFilter = await client.fields.create(shopifyConfig.id, {
      ...collectionFilterPayload,
      api_key: "collection_filter",
    });
  }

  await client.fields.update(fetchMode.id, {
    hint: "Automatic reads the Storefront; manual uses the product pages selected below.",
    appearance: {
      editor: "string_select",
      parameters: {
        options: [
          {
            label: "Automatic",
            value: "auto",
            hint: "List all published products, or filter by a selected collection.",
          },
          {
            label: "Selected products (manual)",
            value: "manual",
            hint: "Use the selected product pages in editorial order.",
          },
        ],
      },
      addons: [
        {
          id: FIELD_DEPENDENCIES_PLUGIN_ID,
          parameters: {
            dependencies: JSON.stringify({
              auto: ["collection_filter", "source_collection"],
              manual: ["selected_products"],
            }),
          },
        },
      ],
    },
  });

  await client.fields.update(collectionFilter.id, { position: fetchMode.position + 1 });
  await client.fields.update(sourceCollection.id, {
    hint: "Required when Collection filter is Selected collection. Empty produces an empty listing.",
    position: fetchMode.position + 2,
  });

  let offset = 0;
  let updatedPages = 0;
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
          const nextBlocks = (rawBlocks as NestedBlock[]).map((block) => {
            if (itemTypeId(block) !== listingSection.id) return block.id;
            const config = listingConfigBlock(block.attributes ?? {});
            if (!config || itemTypeId(config) !== shopifyConfig.id) return block.id;
            const attrs = config.attributes ?? {};
            const current = typeof attrs.collection_filter === "string" ? attrs.collection_filter.trim() : "";
            const desired = hasCollection(attrs.source_collection) ? "selected" : "all";
            if (current === desired) return block.id;

            changed = true;
            return buildBlockRecord({
              id: block.id,
              listing_config: buildBlockRecord({
                id: config.id,
                collection_filter: desired,
              }),
            });
          });
          return [locale, nextBlocks];
        }),
      );

      if (changed) {
        const wasPublished = (page.meta as { status?: string }).status === "published";
        await client.items.update(page.id, { content_page: nextContent } as never);
        if (wasPublished) await client.items.publish(page.id);
        updatedPages += 1;
        console.log(`Updated Page ${page.id}`);
      }
    }

    if (pages.length < 30) break;
    offset += pages.length;
  }

  console.log(`Shopify collection filter ready. Updated ${updatedPages} Page record(s).`);
}
