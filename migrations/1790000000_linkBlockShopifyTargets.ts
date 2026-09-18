import { Client } from "datocms/lib/cma-client-node";

const FIELD_DEPENDENCIES_PLUGIN_ID = "eFlp-ENNSyyi9oDVYogO0w";

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
  if (existing) {
    return client.fields.update(existing.id, payload as never);
  }
  return client.fields.create(ownerId, { ...payload, api_key: apiKey } as never);
}

const TYPE_CONTENT_OPTIONS = [
  { hint: "", label: "Category", value: "category" },
  { hint: "", label: "Post", value: "post" },
  { hint: "", label: "Page", value: "page" },
  { hint: "", label: "Author", value: "author" },
  { hint: "Ficha product_page (PDP).", label: "Product", value: "product" },
  { hint: "Ficha collection_page (PLP).", label: "Collection", value: "collection" },
  { hint: "", label: "External link", value: "external" },
];

/**
 * Destinos Shopify no bloco Link: Hero, CTA, tabs, feature grid e pricing
 * passam a apontar a product_page / collection_page sem URL externa.
 */
export default async function linkBlockShopifyTargets(client: Client): Promise<void> {
  const link = await client.itemTypes.find("link");
  const productPage = await client.itemTypes.find("product_page");
  const collectionPage = await client.itemTypes.find("collection_page");

  await upsertField(client, "link::internal_link_product", link.id, "internal_link_product", {
    label: "Internal link (product)",
    hint: "Type content = Product. Liga a uma ficha product_page (handle Shopify).",
    field_type: "link" as const,
    localized: false as const,
    validators: {
      item_item_type: {
        item_types: [productPage.id],
        on_publish_with_unpublished_references_strategy: "fail" as const,
        on_reference_unpublish_strategy: "delete_references" as const,
        on_reference_delete_strategy: "delete_references" as const,
      },
    },
    appearance: {
      editor: "link_select" as const,
      parameters: { filters: [] },
      addons: [],
    },
  });

  await upsertField(client, "link::internal_link_collection", link.id, "internal_link_collection", {
    label: "Internal link (collection)",
    hint: "Type content = Collection. Liga a uma ficha collection_page (handle Shopify).",
    field_type: "link" as const,
    localized: false as const,
    validators: {
      item_item_type: {
        item_types: [collectionPage.id],
        on_publish_with_unpublished_references_strategy: "fail" as const,
        on_reference_unpublish_strategy: "delete_references" as const,
        on_reference_delete_strategy: "delete_references" as const,
      },
    },
    appearance: {
      editor: "link_select" as const,
      parameters: { filters: [] },
      addons: [],
    },
  });

  const typeContent = await client.fields.find("link::type_content");
  await client.fields.update(typeContent.id, {
    appearance: {
      editor: "string_select",
      parameters: { options: TYPE_CONTENT_OPTIONS },
      addons: [
        {
          id: FIELD_DEPENDENCIES_PLUGIN_ID,
          parameters: {
            dependencies: JSON.stringify({
              page: ["internal_link_page"],
              post: ["internal_link_post"],
              category: ["internal_link_category"],
              author: ["internal_link_author"],
              product: ["internal_link_product"],
              collection: ["internal_link_collection"],
              external: ["external_link"],
            }),
          },
        },
      ],
    },
  });
}
