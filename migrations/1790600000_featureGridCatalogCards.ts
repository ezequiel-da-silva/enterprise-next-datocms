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

async function findField(client: Client, pointer: string) {
  try {
    return await client.fields.find(pointer);
  } catch {
    return null;
  }
}

async function upsertField(
  client: Client,
  pointer: string,
  ownerId: string,
  apiKey: string,
  payload: object,
) {
  const existing = await findField(client, pointer);
  if (existing) return client.fields.update(existing.id, payload as never);
  return client.fields.create(ownerId, { ...payload, api_key: apiKey } as never);
}

const EDITORIAL_FIELDS = [
  "title_card",
  "has_icon",
  "icon_card",
  "has_description",
  "description_card",
  "has_image",
  "image_card",
  "has_link",
  "link_card",
];

export default async function featureGridCatalogCards(client: Client): Promise<void> {
  console.log("Adding Feature grid catalog card sources...");

  const card = await client.itemTypes.find("card");
  const featureGrid = await client.itemTypes.find("feature_grid");
  const productPage = await client.itemTypes.find("product_page");
  const collectionPage = await client.itemTypes.find("collection_page");
  const titleCard = await client.fields.find("card::title_card");

  const cardSource = await upsertField(client, "card::card_source", card.id, "card_source", {
    label: "Card source",
    hint: "Editorial copy and images, or a Shopify product / collection page.",
    field_type: "string",
    localized: false,
    default_value: "editorial",
    validators: {},
    appearance: {
      editor: "string_select",
      parameters: {
        options: [
          {
            label: "Editorial",
            value: "editorial",
            hint: "Title, image, icon and optional CTA from this card.",
          },
          {
            label: "Product",
            value: "product",
            hint: "Title, image and link from a product page. Price from the Storefront.",
          },
          {
            label: "Collection",
            value: "collection",
            hint: "Title, image and link from a collection page.",
          },
        ],
      },
      addons: [
        {
          id: FIELD_DEPENDENCIES_PLUGIN_ID,
          parameters: {
            dependencies: JSON.stringify({
              editorial: EDITORIAL_FIELDS,
              product: ["source_product", "has_description", "description_card"],
              collection: ["source_collection", "has_description", "description_card"],
            }),
          },
        },
      ],
    },
  });

  await upsertField(client, "card::source_product", card.id, "source_product", {
    label: "Product",
    hint: "Required when Card source is Product. Empty cards are omitted on the site.",
    field_type: "link",
    localized: false,
    validators: {
      item_item_type: {
        item_types: [productPage.id],
        on_publish_with_unpublished_references_strategy: "fail",
        on_reference_unpublish_strategy: "delete_references",
        on_reference_delete_strategy: "delete_references",
      },
    },
    appearance: {
      editor: "link_select",
      parameters: { filters: [] },
      addons: [],
    },
  });

  await upsertField(client, "card::source_collection", card.id, "source_collection", {
    label: "Collection",
    hint: "Required when Card source is Collection. Empty cards are omitted on the site.",
    field_type: "link",
    localized: false,
    validators: {
      item_item_type: {
        item_types: [collectionPage.id],
        on_publish_with_unpublished_references_strategy: "fail",
        on_reference_unpublish_strategy: "delete_references",
        on_reference_delete_strategy: "delete_references",
      },
    },
    appearance: {
      editor: "link_select",
      parameters: { filters: [] },
      addons: [],
    },
  });

  await client.fields.update(cardSource.id, { position: Math.max(1, titleCard.position - 2) });
  const sourceProduct = await client.fields.find("card::source_product");
  const sourceCollection = await client.fields.find("card::source_collection");
  await client.fields.update(sourceProduct.id, { position: titleCard.position - 1 });
  await client.fields.update(sourceCollection.id, { position: titleCard.position });

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
            if (itemTypeId(block) !== featureGrid.id) return block.id;
            const cards = (block.attributes?.items_feature_grid as NestedBlock[] | undefined) ?? [];
            if (!Array.isArray(cards) || cards.length === 0) return block.id;

            let cardsChanged = false;
            const nextCards = cards.map((item) => {
              if (itemTypeId(item) !== card.id) return item.id;
              const current =
                typeof item.attributes?.card_source === "string" ? item.attributes.card_source.trim() : "";
              if (current === "editorial" || current === "product" || current === "collection") {
                return item.id;
              }
              cardsChanged = true;
              return buildBlockRecord({ id: item.id, card_source: "editorial" });
            });

            if (!cardsChanged) return block.id;
            changed = true;
            return buildBlockRecord({ id: block.id, items_feature_grid: nextCards });
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

  console.log(`Feature grid catalog cards ready. Updated ${updatedPages} Page record(s).`);
}
