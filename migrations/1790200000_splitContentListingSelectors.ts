import { buildBlockRecord } from "@datocms/cma-client-node";
import { Client } from "datocms/lib/cma-client-node";

const FIELD_DEPENDENCIES_PLUGIN_ID = "eFlp-ENNSyyi9oDVYogO0w";

type LegacyListingMode =
  | "blog_auto_all"
  | "blog_auto_selected"
  | "blog_auto_none"
  | "blog_manual"
  | "shopify_auto_all"
  | "shopify_auto_collection"
  | "shopify_manual";

type ContentSource = "blog" | "shopify";
type BlogPostSelection = "all_categories" | "selected_categories" | "no_categories" | "manual";
type ShopifyProductSelection = "all_products" | "collection" | "manual";

type NestedBlock = {
  id: string;
  __itemTypeId?: string;
  attributes?: Record<string, unknown>;
  relationships?: { item_type?: { data?: { id?: string } } };
};

const LEGACY_MODES = new Set<LegacyListingMode>([
  "blog_auto_all",
  "blog_auto_selected",
  "blog_auto_none",
  "blog_manual",
  "shopify_auto_all",
  "shopify_auto_collection",
  "shopify_manual",
]);

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

function legacyMode(attributes: Record<string, unknown>): LegacyListingMode {
  const raw = normalized(attributes.content_source ?? attributes.listing_mode);
  if (LEGACY_MODES.has(raw as LegacyListingMode)) return raw as LegacyListingMode;

  const source = raw.includes("shop") ? "shopify" : "blog";
  const fetch = normalized(attributes.fetch_mode);
  const manual = fetch.includes("manual") || fetch.includes("curad");
  const filter = normalized(attributes.category_display).replace(/[\s-]+/g, "_");
  const selected =
    filter.includes("selected") || filter.includes("selecion") || filter.includes("escolhid");
  const none = filter.includes("none") || filter.includes("nenhum") || filter.includes("ocult");

  if (source === "shopify") {
    if (manual) return "shopify_manual";
    return selected ? "shopify_auto_collection" : "shopify_auto_all";
  }
  if (manual) return "blog_manual";
  if (selected) return "blog_auto_selected";
  if (none) return "blog_auto_none";
  return "blog_auto_all";
}

function sourceFor(mode: LegacyListingMode): ContentSource {
  return mode.startsWith("shopify_") ? "shopify" : "blog";
}

function blogSelectionFor(mode: LegacyListingMode): BlogPostSelection {
  if (mode === "blog_auto_selected") return "selected_categories";
  if (mode === "blog_auto_none") return "no_categories";
  if (mode === "blog_manual") return "manual";
  return "all_categories";
}

function shopifySelectionFor(mode: LegacyListingMode): ShopifyProductSelection {
  if (mode === "shopify_auto_collection") return "collection";
  if (mode === "shopify_manual") return "manual";
  return "all_products";
}

function itemTypeId(block: NestedBlock): string | undefined {
  return block.__itemTypeId ?? block.relationships?.item_type?.data?.id;
}

export default async function splitContentListingSelectors(client: Client): Promise<void> {
  console.log("Splitting Content listing configuration by source...");

  const blockType = await client.itemTypes.find("content_listing_section");
  const currentSourceField =
    (await findField(client, "content_listing_section::content_source")) ??
    (await client.fields.find("content_listing_section::listing_mode"));

  let blogSelection = await findField(client, "content_listing_section::blog_post_selection");
  if (!blogSelection) {
    blogSelection = await client.fields.create(blockType.id, {
      label: "Blog post selection",
      api_key: "blog_post_selection",
      hint: "Choose which Blog posts and category controls appear in this listing.",
      field_type: "string",
      localized: false,
      default_value: "all_categories",
      validators: {},
      appearance: {
        editor: "string_select",
        parameters: {
          options: [
            {
              label: "All posts and category filters",
              value: "all_categories",
              hint: "Shows all published posts and all available category filters.",
            },
            {
              label: "Posts from selected categories",
              value: "selected_categories",
              hint: "Shows only posts from the Blog categories selected below.",
            },
            {
              label: "All posts without category filters",
              value: "no_categories",
              hint: "Shows all published posts without category filter controls.",
            },
            {
              label: "Selected posts (manual)",
              value: "manual",
              hint: "Shows the selected posts in editorial order.",
            },
          ],
        },
        addons: [
          {
            id: FIELD_DEPENDENCIES_PLUGIN_ID,
            parameters: {
              dependencies: JSON.stringify({
                all_categories: ["all_categories_label", "show_sort_tabs"],
                selected_categories: [
                  "all_categories_label",
                  "selected_categories",
                  "show_sort_tabs",
                ],
                no_categories: ["show_sort_tabs"],
                manual: ["manual_posts"],
              }),
            },
          },
        ],
      },
    });
  }

  let shopifySelection = await findField(
    client,
    "content_listing_section::shopify_product_selection",
  );
  if (!shopifySelection) {
    shopifySelection = await client.fields.create(blockType.id, {
      label: "Shopify product selection",
      api_key: "shopify_product_selection",
      hint: "Choose which Shopify products supply this listing.",
      field_type: "string",
      localized: false,
      default_value: "all_products",
      validators: {},
      appearance: {
        editor: "string_select",
        parameters: {
          options: [
            {
              label: "All published products",
              value: "all_products",
              hint: "Shows Storefront products that have a published product page.",
            },
            {
              label: "Products from a collection",
              value: "collection",
              hint: "Shows products from the Shopify collection selected below.",
            },
            {
              label: "Selected products (manual)",
              value: "manual",
              hint: "Shows the selected product pages in editorial order.",
            },
          ],
        },
        addons: [
          {
            id: FIELD_DEPENDENCIES_PLUGIN_ID,
            parameters: {
              dependencies: JSON.stringify({
                all_products: [],
                collection: ["source_collection"],
                manual: ["selected_products"],
              }),
            },
          },
        ],
      },
    });
  }

  await client.fields.update(currentSourceField.id, {
    label: "Content source",
    api_key: "content_source",
    hint: "Choose whether this section lists Blog posts or Shopify products.",
    default_value: "blog",
    appearance: {
      editor: "string_select",
      parameters: {
        options: [
          {
            label: "Blog",
            value: "blog",
            hint: "Configure posts and Blog category controls.",
          },
          {
            label: "Shopify",
            value: "shopify",
            hint: "Configure products from the Shopify Storefront.",
          },
        ],
      },
      addons: [
        {
          id: FIELD_DEPENDENCIES_PLUGIN_ID,
          parameters: {
            dependencies: JSON.stringify({
              blog: ["blog_post_selection"],
              shopify: ["shopify_product_selection"],
            }),
          },
        },
      ],
    },
  });
  await client.fields.update(blogSelection.id, { position: currentSourceField.position + 1 });
  await client.fields.update(shopifySelection.id, { position: currentSourceField.position + 2 });

  await client.itemTypes.update(blockType.id, {
    hint: "List Blog posts or Shopify products. Choose the source, then select the content scope.",
  });

  const labelUpdates = [
    {
      pointer: "content_listing_section::selected_categories",
      label: "Selected Blog categories",
      hint: "Blog — include posts from these categories.",
    },
    {
      pointer: "content_listing_section::manual_posts",
      label: "Selected Blog posts",
      hint: "Blog — choose posts in the exact editorial order.",
    },
    {
      pointer: "content_listing_section::source_collection",
      label: "Shopify collection",
      hint: "Shopify — list products from this collection that have a published product page.",
    },
    {
      pointer: "content_listing_section::selected_products",
      label: "Selected Shopify products",
      hint: "Shopify — choose product pages in the exact editorial order.",
    },
    {
      pointer: "content_listing_section::all_categories_label",
      label: "All categories label",
      hint: "Blog — label for the filter that shows posts from every category.",
    },
    {
      pointer: "content_listing_section::show_sort_tabs",
      label: "Show post sorting controls",
      hint: "Blog — show Recent, Oldest and Popular sorting controls.",
    },
  ];
  for (const update of labelUpdates) {
    const field = await client.fields.find(update.pointer);
    await client.fields.update(field.id, { label: update.label, hint: update.hint });
  }

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
          const blocks = rawBlocks as NestedBlock[];
          const nextBlocks = blocks.map((block) => {
            if (itemTypeId(block) !== blockType.id) return block.id;
            const attributes = block.attributes ?? {};
            const currentSource = normalized(attributes.content_source);
            const currentBlogSelection = normalized(attributes.blog_post_selection);
            const currentShopifySelection = normalized(attributes.shopify_product_selection);

            if (
              (currentSource === "blog" || currentSource === "shopify") &&
              currentBlogSelection &&
              currentShopifySelection
            ) {
              return block.id;
            }

            const mode = legacyMode(attributes);
            changed = true;
            return buildBlockRecord({
              id: block.id,
              content_source: sourceFor(mode),
              blog_post_selection:
                currentBlogSelection || blogSelectionFor(mode),
              shopify_product_selection:
                currentShopifySelection || shopifySelectionFor(mode),
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

  console.log(`Content listing selectors ready. Updated ${updatedPages} Page record(s).`);
}
