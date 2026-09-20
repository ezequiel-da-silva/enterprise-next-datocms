import { buildBlockRecord } from "@datocms/cma-client-node";
import { Client } from "datocms/lib/cma-client-node";

const FIELD_DEPENDENCIES_PLUGIN_ID = "eFlp-ENNSyyi9oDVYogO0w";

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

async function findOrCreateBlock(client: Client, apiKey: string, name: string, hint: string) {
  try {
    const existing = await client.itemTypes.find(apiKey);
    await client.itemTypes.update(existing.id, { name, hint });
    return existing;
  } catch {
    return client.itemTypes.create({
      name,
      api_key: apiKey,
      modular_block: true,
      hint,
    });
  }
}

function itemTypeId(block: NestedBlock): string | undefined {
  return block.__itemTypeId ?? block.relationships?.item_type?.data?.id;
}

function normalized(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function isShopify(attributes: Record<string, unknown>): boolean {
  const source = normalized(attributes.content_source);
  if (source) return source.includes("shop");
  return normalized(attributes.listing_mode).startsWith("shopify_");
}

function blogSelection(attributes: Record<string, unknown>): string {
  const current = normalized(attributes.blog_post_selection);
  if (current) return current;
  const legacy = normalized(attributes.listing_mode);
  if (legacy === "blog_auto_selected") return "selected_categories";
  if (legacy === "blog_auto_none") return "no_categories";
  if (legacy === "blog_manual") return "manual";
  return "all_categories";
}

function shopifySelection(attributes: Record<string, unknown>): string {
  const current = normalized(attributes.shopify_product_selection);
  if (current) return current;
  const legacy = normalized(attributes.listing_mode);
  if (legacy === "shopify_auto_collection") return "collection";
  if (legacy === "shopify_manual") return "manual";
  return "all_products";
}

export default async function nestContentListingConfiguration(client: Client): Promise<void> {
  console.log("Creating nested Content listing configuration blocks...");

  const listingSection = await client.itemTypes.find("content_listing_section");
  const category = await client.itemTypes.find("category");
  const post = await client.itemTypes.find("post");
  const collectionPage = await client.itemTypes.find("collection_page");
  const productPage = await client.itemTypes.find("product_page");

  const blogConfig = await findOrCreateBlock(
    client,
    "blog_listing_config",
    "Blog listing configuration",
    "Configures automatic Blog discovery, category filters, or a manual post selection.",
  );
  const shopifyConfig = await findOrCreateBlock(
    client,
    "shopify_listing_config",
    "Shopify listing configuration",
    "Configures automatic Storefront products, an optional collection, or a manual product selection.",
  );

  await upsertField(client, "blog_listing_config::fetch_mode", blogConfig.id, "fetch_mode", {
    label: "Fetch mode",
    hint: "Automatic discovers published posts; manual uses the posts selected below.",
    field_type: "string",
    localized: false,
    default_value: "auto",
    validators: {},
    appearance: {
      editor: "string_select",
      parameters: {
        options: [
          {
            label: "Automatic",
            value: "auto",
            hint: "Discover published posts and configure category filters.",
          },
          {
            label: "Selected posts (manual)",
            value: "manual",
            hint: "Use the selected posts in editorial order.",
          },
        ],
      },
      addons: [
        {
          id: FIELD_DEPENDENCIES_PLUGIN_ID,
          parameters: {
            dependencies: JSON.stringify({
              auto: [
                "filter_display",
                "all_categories_label",
                "selected_categories",
                "show_sort_tabs",
              ],
              manual: ["manual_posts"],
            }),
          },
        },
      ],
    },
  });

  await upsertField(
    client,
    "blog_listing_config::filter_display",
    blogConfig.id,
    "filter_display",
    {
      label: "Category filter",
      hint: "Choose which Blog categories are available in the listing controls.",
      field_type: "string",
      localized: false,
      default_value: "all",
      validators: {},
      appearance: {
        editor: "string_select",
        parameters: {
          options: [
            {
              label: "All categories",
              value: "all",
              hint: "Show all categories that contain posts.",
            },
            {
              label: "Selected categories",
              value: "selected",
              hint: "Show posts and filters only from the categories selected below.",
            },
            {
              label: "Hide category filters",
              value: "none",
              hint: "Show posts without category filter controls.",
            },
          ],
        },
        addons: [
          {
            id: FIELD_DEPENDENCIES_PLUGIN_ID,
            parameters: {
              dependencies: JSON.stringify({
                all: ["all_categories_label", "show_sort_tabs"],
                selected: ["all_categories_label", "selected_categories", "show_sort_tabs"],
                none: ["show_sort_tabs"],
              }),
            },
          },
        ],
      },
    },
  );

  await upsertField(
    client,
    "blog_listing_config::all_categories_label",
    blogConfig.id,
    "all_categories_label",
    {
      label: "All categories label",
      hint: "Label for the filter that shows posts from every category.",
      field_type: "string",
      localized: false,
      default_value: "All",
      validators: {},
      appearance: {
        editor: "single_line",
        parameters: { heading: false },
        addons: [],
      },
    },
  );

  await upsertField(
    client,
    "blog_listing_config::selected_categories",
    blogConfig.id,
    "selected_categories",
    {
      label: "Selected Blog categories",
      hint: "Include posts from these categories.",
      field_type: "links",
      localized: false,
      validators: {
        items_item_type: {
          item_types: [category.id],
          on_publish_with_unpublished_references_strategy: "fail",
          on_reference_unpublish_strategy: "delete_references",
          on_reference_delete_strategy: "delete_references",
        },
      },
      appearance: {
        editor: "links_select",
        parameters: {},
        addons: [],
      },
    },
  );

  await upsertField(
    client,
    "blog_listing_config::show_sort_tabs",
    blogConfig.id,
    "show_sort_tabs",
    {
      label: "Show post sorting controls",
      hint: "Show Recent, Oldest and Popular sorting controls.",
      field_type: "boolean",
      localized: false,
      default_value: true,
      validators: {},
      appearance: {
        editor: "boolean",
        parameters: {},
        addons: [],
      },
    },
  );

  await upsertField(client, "blog_listing_config::manual_posts", blogConfig.id, "manual_posts", {
    label: "Selected Blog posts",
    hint: "Choose posts in the exact editorial order.",
    field_type: "links",
    localized: false,
    validators: {
      items_item_type: {
        item_types: [post.id],
        on_publish_with_unpublished_references_strategy: "fail",
        on_reference_unpublish_strategy: "delete_references",
        on_reference_delete_strategy: "delete_references",
      },
    },
    appearance: {
      editor: "links_select",
      parameters: {},
      addons: [],
    },
  });

  await upsertField(
    client,
    "shopify_listing_config::fetch_mode",
    shopifyConfig.id,
    "fetch_mode",
    {
      label: "Fetch mode",
      hint: "Automatic reads the Storefront; manual uses the product pages selected below.",
      field_type: "string",
      localized: false,
      default_value: "auto",
      validators: {},
      appearance: {
        editor: "string_select",
        parameters: {
          options: [
            {
              label: "Automatic",
              value: "auto",
              hint: "List all published products or filter by an optional collection.",
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
                auto: ["source_collection"],
                manual: ["selected_products"],
              }),
            },
          },
        ],
      },
    },
  );

  await upsertField(
    client,
    "shopify_listing_config::source_collection",
    shopifyConfig.id,
    "source_collection",
    {
      label: "Shopify collection",
      hint: "Optional. Empty lists every published product page; selected filters by this collection.",
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
        parameters: {},
        addons: [],
      },
    },
  );

  await upsertField(
    client,
    "shopify_listing_config::selected_products",
    shopifyConfig.id,
    "selected_products",
    {
      label: "Selected Shopify products",
      hint: "Choose product pages in the exact editorial order.",
      field_type: "links",
      localized: false,
      validators: {
        items_item_type: {
          item_types: [productPage.id],
          on_publish_with_unpublished_references_strategy: "fail",
          on_reference_unpublish_strategy: "delete_references",
          on_reference_delete_strategy: "delete_references",
        },
        size: { max: 50 },
      },
      appearance: {
        editor: "links_select",
        parameters: {},
        addons: [],
      },
    },
  );

  const listingConfig = await upsertField(
    client,
    "content_listing_section::listing_config",
    listingSection.id,
    "listing_config",
    {
      label: "Listing configuration",
      hint: "Choose Blog or Shopify, then configure how content is acquired.",
      field_type: "single_block",
      localized: false,
      validators: {
        required: {},
        single_block_blocks: { item_types: [blogConfig.id, shopifyConfig.id] },
      },
      appearance: {
        editor: "framed_single_block",
        parameters: { start_collapsed: false },
        addons: [],
      },
    },
  );
  const textHeader = await client.fields.find("content_listing_section::text_header_section");
  await client.fields.update(listingConfig.id, { position: textHeader.position + 1 });
  await client.itemTypes.update(listingSection.id, {
    hint: "Presentation is shared; the nested configuration chooses Blog or Shopify acquisition.",
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
            const attributes = block.attributes ?? {};
            if (isRecord(attributes.listing_config)) return block.id;

            changed = true;
            if (isShopify(attributes)) {
              const selection = shopifySelection(attributes);
              return buildBlockRecord({
                id: block.id,
                listing_config: buildBlockRecord({
                  item_type: { type: "item_type", id: shopifyConfig.id },
                  fetch_mode: selection === "manual" ? "manual" : "auto",
                  source_collection:
                    selection === "collection" ? (attributes.source_collection ?? null) : null,
                  selected_products:
                    selection === "manual" ? (attributes.selected_products ?? []) : [],
                }),
              });
            }

            const selection = blogSelection(attributes);
            return buildBlockRecord({
              id: block.id,
              listing_config: buildBlockRecord({
                item_type: { type: "item_type", id: blogConfig.id },
                fetch_mode: selection === "manual" ? "manual" : "auto",
                filter_display:
                  selection === "selected_categories"
                    ? "selected"
                    : selection === "no_categories"
                      ? "none"
                      : "all",
                all_categories_label: attributes.all_categories_label ?? "All",
                selected_categories: attributes.selected_categories ?? [],
                show_sort_tabs: attributes.show_sort_tabs !== false,
                manual_posts: attributes.manual_posts ?? [],
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

  const parentFields = [
    "content_source",
    "blog_post_selection",
    "shopify_product_selection",
    "all_categories_label",
    "selected_categories",
    "show_sort_tabs",
    "manual_posts",
    "source_collection",
    "selected_products",
  ];
  for (const apiKey of parentFields) {
    const field = await findField(client, `content_listing_section::${apiKey}`);
    if (field) await client.fields.destroy(field.id);
  }

  console.log(`Nested listing configuration ready. Updated ${updatedPages} Page record(s).`);
}
