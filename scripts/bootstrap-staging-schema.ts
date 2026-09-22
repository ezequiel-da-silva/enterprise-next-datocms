/**
 * One-shot CMA bootstrap for Staging (site 234806).
 * Recreates the current Next CDA api_keys on an empty project.
 *
 * Never run against production (profile `default` / site 201057).
 *
 *   npx datocms login
 *   npx datocms link --profile=staging --site-id=234806
 *   npx datocms cma:script scripts/bootstrap-staging-schema.ts --profile=staging
 */
import { readdirSync } from "node:fs";
import { join } from "node:path";

import type { Client } from "datocms/lib/cma-client-node";
import { ApiError, type ApiTypes } from "@datocms/cma-client-node";

type IdMap = Map<string, string>;

type ItemKind = {
  apiKey: string;
  name: string;
  modular: boolean;
  singleton?: boolean;
  draft?: boolean;
};

const FILE_EXTS = ["jpg", "jpeg", "png", "gif", "webp", "avif"];

const MODELS: ItemKind[] = [
  { apiKey: "schema_migration", name: "Schema migration", modular: false },
  { apiKey: "page", name: "Page", modular: false, draft: true },
  { apiKey: "post", name: "Blog post", modular: false, draft: true },
  { apiKey: "author", name: "Author", modular: false, draft: true },
  { apiKey: "category", name: "Category", modular: false, draft: true },
  { apiKey: "legal_page", name: "Legal page", modular: false, draft: true },
  { apiKey: "product_page", name: "Product page", modular: false, draft: true },
  { apiKey: "collection_page", name: "Collection page", modular: false, draft: true },
  { apiKey: "redirect", name: "Redirect", modular: false, draft: true },
  { apiKey: "user_review", name: "User review", modular: false, draft: true },
  { apiKey: "global_setting", name: "Global setting", modular: false, singleton: true },
  { apiKey: "navigation", name: "Navigation", modular: false, singleton: true },
];

const BLOCKS: ItemKind[] = [
  "image_block",
  "hero_image_block",
  "card_image_block",
  "banner_image_block",
  "image_gallery_block",
  "video_block",
  "link",
  "text_header",
  "carousel_setting",
  "card",
  "faq_item",
  "stat_card",
  "pricing_card",
  "step_card",
  "tab_item",
  "social_link",
  "nav_item_modular",
  "nav_item_simple",
  "blog_listing_config",
  "shopify_listing_config",
  "hero_section",
  "feature_grid",
  "faq_group",
  "cta_banner",
  "logo_grid",
  "reviews_section",
  "pricing_section",
  "stats_section",
  "steps_section",
  "tabs_section",
  "team_section",
  "content_listing_section",
  "text_section",
  "contact_form_section",
  "search_section",
].map((apiKey) => ({
  apiKey,
  name: apiKey
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" "),
  modular: true,
}));

const TITLE_FIELDS: Record<string, string> = {
  schema_migration: "name",
  page: "title",
  post: "post_title",
  author: "author_name",
  category: "category_name",
  legal_page: "title",
  product_page: "title",
  collection_page: "title",
  redirect: "from_path_redirect",
  user_review: "author_name",
};

function fileValidators(required: boolean) {
  return {
    ...(required ? { required: {} } : {}),
    extension: { extensions: FILE_EXTS },
    required_alt_title: { title: true, alt: true },
  };
}

function linkVal(ids: IdMap, keys: string[]) {
  return {
    item_item_type: {
      item_types: keys.map((k) => must(ids, k)),
      on_publish_with_unpublished_references_strategy: "fail" as const,
      on_reference_unpublish_strategy: "fail" as const,
      on_reference_delete_strategy: "fail" as const,
    },
  };
}

function linksVal(ids: IdMap, keys: string[]) {
  return {
    items_item_type: {
      item_types: keys.map((k) => must(ids, k)),
      on_publish_with_unpublished_references_strategy: "fail" as const,
      on_reference_unpublish_strategy: "fail" as const,
      on_reference_delete_strategy: "fail" as const,
    },
  };
}

function richVal(ids: IdMap, keys: string[]) {
  return { rich_text_blocks: { item_types: keys.map((k) => must(ids, k)) } };
}

function singleVal(ids: IdMap, keys: string[]) {
  return { single_block_blocks: { item_types: keys.map((k) => must(ids, k)) } };
}

function stVal(ids: IdMap, blocks: string[], links: string[]) {
  return {
    structured_text_blocks: { item_types: blocks.map((k) => must(ids, k)) },
    structured_text_inline_blocks: { item_types: [] as string[] },
    structured_text_links: {
      item_types: links.map((k) => must(ids, k)),
      on_publish_with_unpublished_references_strategy: "fail" as const,
      on_reference_unpublish_strategy: "fail" as const,
      on_reference_delete_strategy: "fail" as const,
    },
  };
}

function must(ids: IdMap, key: string): string {
  const id = ids.get(key);
  if (!id) throw new Error(`Missing item type ${key}`);
  return id;
}

type FieldSpec = {
  owner: string;
  apiKey: string;
  label: string;
  fieldType:
    | "string"
    | "text"
    | "boolean"
    | "integer"
    | "float"
    | "file"
    | "gallery"
    | "video"
    | "seo"
    | "json"
    | "color"
    | "slug"
    | "link"
    | "links"
    | "rich_text"
    | "single_block"
    | "structured_text";
  localized?: boolean;
  validators?: (ids: IdMap) => object;
  hint?: string;
  defaultValue?: string | boolean | number | null;
};

function fields(): FieldSpec[] {
  return [
    { owner: "schema_migration", apiKey: "name", label: "Name", fieldType: "string" },

    { owner: "image_block", apiKey: "asset", label: "Image", fieldType: "file", validators: () => fileValidators(true) },
    {
      owner: "image_block",
      apiKey: "asset_desktop",
      label: "Image desktop",
      fieldType: "file",
      validators: () => fileValidators(true),
    },
    {
      owner: "hero_image_block",
      apiKey: "asset_mobile",
      label: "Asset mobile",
      fieldType: "file",
      validators: () => fileValidators(true),
    },
    {
      owner: "hero_image_block",
      apiKey: "asset_desktop",
      label: "Asset desktop",
      fieldType: "file",
      validators: () => fileValidators(true),
    },
    {
      owner: "card_image_block",
      apiKey: "asset_mobile",
      label: "Asset mobile",
      fieldType: "file",
      validators: () => fileValidators(true),
    },
    {
      owner: "card_image_block",
      apiKey: "asset_desktop",
      label: "Asset desktop",
      fieldType: "file",
      validators: () => fileValidators(true),
    },
    {
      owner: "banner_image_block",
      apiKey: "asset_mobile",
      label: "Asset mobile",
      fieldType: "file",
      validators: () => fileValidators(true),
    },
    {
      owner: "banner_image_block",
      apiKey: "asset_desktop",
      label: "Asset desktop",
      fieldType: "file",
      validators: () => fileValidators(true),
    },
    { owner: "image_gallery_block", apiKey: "assets", label: "Assets", fieldType: "gallery" },
    { owner: "video_block", apiKey: "asset", label: "Asset", fieldType: "video" },

    { owner: "link", apiKey: "cta_label", label: "CTA label", fieldType: "string" },
    { owner: "link", apiKey: "cta_link_aria", label: "CTA aria", fieldType: "string" },
    { owner: "link", apiKey: "external_link", label: "External link", fieldType: "string" },
    { owner: "link", apiKey: "open_in_new_tab", label: "Open in new tab", fieldType: "boolean", defaultValue: false },
    { owner: "link", apiKey: "type_content", label: "Type", fieldType: "string" },
    {
      owner: "link",
      apiKey: "internal_link_page",
      label: "Internal page",
      fieldType: "link",
      validators: (ids) => linkVal(ids, ["page"]),
    },
    {
      owner: "link",
      apiKey: "internal_link_post",
      label: "Internal post",
      fieldType: "link",
      validators: (ids) => linkVal(ids, ["post"]),
    },
    {
      owner: "link",
      apiKey: "internal_link_category",
      label: "Internal category",
      fieldType: "link",
      validators: (ids) => linkVal(ids, ["category"]),
    },
    {
      owner: "link",
      apiKey: "internal_link_author",
      label: "Internal author",
      fieldType: "link",
      validators: (ids) => linkVal(ids, ["author"]),
    },
    {
      owner: "link",
      apiKey: "internal_link_product",
      label: "Internal product",
      fieldType: "link",
      validators: (ids) => linkVal(ids, ["product_page"]),
    },
    {
      owner: "link",
      apiKey: "internal_link_collection",
      label: "Internal collection",
      fieldType: "link",
      validators: (ids) => linkVal(ids, ["collection_page"]),
    },

    { owner: "text_header", apiKey: "title", label: "Title", fieldType: "string" },
    { owner: "text_header", apiKey: "has_description", label: "Has description", fieldType: "boolean", defaultValue: false },
    { owner: "text_header", apiKey: "description", label: "Description", fieldType: "string" },
    { owner: "text_header", apiKey: "has_section_id", label: "Has section id", fieldType: "boolean", defaultValue: false },
    { owner: "text_header", apiKey: "section_id", label: "Section id", fieldType: "string" },

    { owner: "carousel_setting", apiKey: "autoplay", label: "Autoplay", fieldType: "boolean", defaultValue: false },
    { owner: "carousel_setting", apiKey: "autoplay_interval", label: "Autoplay interval", fieldType: "integer" },
    { owner: "carousel_setting", apiKey: "loop", label: "Loop", fieldType: "boolean", defaultValue: true },
    { owner: "carousel_setting", apiKey: "show_arrows", label: "Show arrows", fieldType: "boolean", defaultValue: true },
    { owner: "carousel_setting", apiKey: "show_dots", label: "Show dots", fieldType: "boolean", defaultValue: true },

    { owner: "card", apiKey: "card_source", label: "Card source", fieldType: "string", defaultValue: "editorial" },
    { owner: "card", apiKey: "title_card", label: "Title", fieldType: "string" },
    { owner: "card", apiKey: "has_icon", label: "Has icon", fieldType: "boolean", defaultValue: false },
    { owner: "card", apiKey: "icon_card", label: "Icon", fieldType: "json" },
    { owner: "card", apiKey: "has_description", label: "Has description", fieldType: "boolean", defaultValue: false },
    { owner: "card", apiKey: "description_card", label: "Description", fieldType: "string" },
    { owner: "card", apiKey: "has_image", label: "Has image", fieldType: "boolean", defaultValue: false },
    {
      owner: "card",
      apiKey: "image_card",
      label: "Image",
      fieldType: "single_block",
      validators: (ids) => singleVal(ids, ["card_image_block"]),
    },
    { owner: "card", apiKey: "has_link", label: "Has link", fieldType: "boolean", defaultValue: false },
    {
      owner: "card",
      apiKey: "link_card",
      label: "Link",
      fieldType: "single_block",
      validators: (ids) => singleVal(ids, ["link"]),
    },
    {
      owner: "card",
      apiKey: "source_product",
      label: "Source product",
      fieldType: "link",
      validators: (ids) => linkVal(ids, ["product_page"]),
    },
    {
      owner: "card",
      apiKey: "source_collection",
      label: "Source collection",
      fieldType: "link",
      validators: (ids) => linkVal(ids, ["collection_page"]),
    },

    { owner: "faq_item", apiKey: "question", label: "Question", fieldType: "structured_text", validators: (ids) => stVal(ids, [], []) },
    { owner: "faq_item", apiKey: "answer", label: "Answer", fieldType: "structured_text", validators: (ids) => stVal(ids, [], []) },

    { owner: "stat_card", apiKey: "value", label: "Value", fieldType: "string" },
    { owner: "stat_card", apiKey: "label", label: "Label", fieldType: "string" },
    { owner: "stat_card", apiKey: "has_description", label: "Has description", fieldType: "boolean", defaultValue: false },
    { owner: "stat_card", apiKey: "description", label: "Description", fieldType: "string" },

    { owner: "pricing_card", apiKey: "name", label: "Name", fieldType: "string" },
    { owner: "pricing_card", apiKey: "amount", label: "Amount", fieldType: "float" },
    { owner: "pricing_card", apiKey: "currency", label: "Currency", fieldType: "string" },
    { owner: "pricing_card", apiKey: "billing_period", label: "Billing period", fieldType: "string" },
    { owner: "pricing_card", apiKey: "price_type", label: "Price type", fieldType: "string" },
    { owner: "pricing_card", apiKey: "is_popular", label: "Popular", fieldType: "boolean", defaultValue: false },
    { owner: "pricing_card", apiKey: "has_description", label: "Has description", fieldType: "boolean", defaultValue: false },
    { owner: "pricing_card", apiKey: "description", label: "Description", fieldType: "string" },
    { owner: "pricing_card", apiKey: "features", label: "Features", fieldType: "text" },
    { owner: "pricing_card", apiKey: "has_button", label: "Has button", fieldType: "boolean", defaultValue: false },
    {
      owner: "pricing_card",
      apiKey: "cta_button",
      label: "CTA",
      fieldType: "rich_text",
      validators: (ids) => richVal(ids, ["link"]),
    },

    { owner: "step_card", apiKey: "title", label: "Title", fieldType: "string" },
    { owner: "step_card", apiKey: "has_description", label: "Has description", fieldType: "boolean", defaultValue: false },
    { owner: "step_card", apiKey: "description", label: "Description", fieldType: "text" },
    { owner: "step_card", apiKey: "has_image", label: "Has image", fieldType: "boolean", defaultValue: false },
    {
      owner: "step_card",
      apiKey: "media_image",
      label: "Media",
      fieldType: "rich_text",
      validators: (ids) => richVal(ids, ["card_image_block"]),
    },

    { owner: "tab_item", apiKey: "label_tab", label: "Tab label", fieldType: "string" },
    { owner: "tab_item", apiKey: "title", label: "Title", fieldType: "string" },
    { owner: "tab_item", apiKey: "has_description", label: "Has description", fieldType: "boolean", defaultValue: false },
    { owner: "tab_item", apiKey: "description", label: "Description", fieldType: "text" },
    { owner: "tab_item", apiKey: "has_image", label: "Has image", fieldType: "boolean", defaultValue: false },
    {
      owner: "tab_item",
      apiKey: "media_image",
      label: "Media",
      fieldType: "single_block",
      validators: (ids) => singleVal(ids, ["card_image_block"]),
    },
    { owner: "tab_item", apiKey: "has_link", label: "Has link", fieldType: "boolean", defaultValue: false },
    {
      owner: "tab_item",
      apiKey: "cta_link",
      label: "CTA",
      fieldType: "single_block",
      validators: (ids) => singleVal(ids, ["link"]),
    },

    { owner: "social_link", apiKey: "plataforma", label: "Platform", fieldType: "string" },
    { owner: "social_link", apiKey: "url", label: "URL", fieldType: "string" },
    { owner: "social_link", apiKey: "link_aria", label: "Aria", fieldType: "string" },
    { owner: "social_link", apiKey: "open_in_new_tab", label: "Open in new tab", fieldType: "boolean", defaultValue: true },
    { owner: "social_link", apiKey: "image", label: "Image", fieldType: "file", validators: () => fileValidators(false) },

    { owner: "nav_item_modular", apiKey: "nav_item_label", label: "Label", fieldType: "string" },
    { owner: "nav_item_modular", apiKey: "nav_item_link", label: "Link", fieldType: "string" },
    { owner: "nav_item_modular", apiKey: "nav_item_link_aria", label: "Aria", fieldType: "string" },
    {
      owner: "nav_item_modular",
      apiKey: "open_in_new_tab",
      label: "Open in new tab",
      fieldType: "boolean",
      defaultValue: false,
    },
    {
      owner: "nav_item_modular",
      apiKey: "submenu",
      label: "Submenu",
      fieldType: "rich_text",
      validators: (ids) => richVal(ids, ["nav_item_modular"]),
    },

    { owner: "nav_item_simple", apiKey: "nav_item_label", label: "Label", fieldType: "string" },
    { owner: "nav_item_simple", apiKey: "nav_item_link", label: "Link", fieldType: "string" },
    { owner: "nav_item_simple", apiKey: "nav_item_link_aria", label: "Aria", fieldType: "string" },
    {
      owner: "nav_item_simple",
      apiKey: "open_in_new_tab",
      label: "Open in new tab",
      fieldType: "boolean",
      defaultValue: false,
    },
    {
      owner: "nav_item_simple",
      apiKey: "submenu",
      label: "Submenu",
      fieldType: "rich_text",
      validators: (ids) => richVal(ids, ["nav_item_modular"]),
    },

    { owner: "blog_listing_config", apiKey: "fetch_mode", label: "Fetch mode", fieldType: "string" },
    { owner: "blog_listing_config", apiKey: "filter_display", label: "Filter display", fieldType: "string" },
    { owner: "blog_listing_config", apiKey: "all_categories_label", label: "All categories label", fieldType: "string" },
    { owner: "blog_listing_config", apiKey: "show_sort_tabs", label: "Show sort tabs", fieldType: "boolean", defaultValue: false },
    {
      owner: "blog_listing_config",
      apiKey: "manual_posts",
      label: "Manual posts",
      fieldType: "links",
      validators: (ids) => linksVal(ids, ["post"]),
    },
    {
      owner: "blog_listing_config",
      apiKey: "selected_categories",
      label: "Categories",
      fieldType: "links",
      validators: (ids) => linksVal(ids, ["category"]),
    },

    { owner: "shopify_listing_config", apiKey: "fetch_mode", label: "Fetch mode", fieldType: "string" },
    { owner: "shopify_listing_config", apiKey: "collection_filter", label: "Collection filter", fieldType: "string" },
    {
      owner: "shopify_listing_config",
      apiKey: "source_collection",
      label: "Source collection",
      fieldType: "link",
      validators: (ids) => linkVal(ids, ["collection_page"]),
    },
    {
      owner: "shopify_listing_config",
      apiKey: "selected_products",
      label: "Selected products",
      fieldType: "links",
      validators: (ids) => linksVal(ids, ["product_page"]),
    },

    { owner: "hero_section", apiKey: "layout_hero", label: "Layout", fieldType: "string" },
    { owner: "hero_section", apiKey: "title_hero", label: "Title", fieldType: "string" },
    {
      owner: "hero_section",
      apiKey: "subtitle_hero",
      label: "Subtitle",
      fieldType: "structured_text",
      validators: (ids) => stVal(ids, [], []),
    },
    { owner: "hero_section", apiKey: "show_button", label: "Show button", fieldType: "boolean", defaultValue: false },
    {
      owner: "hero_section",
      apiKey: "button_hero",
      label: "Buttons",
      fieldType: "rich_text",
      validators: (ids) => richVal(ids, ["link"]),
    },
    { owner: "hero_section", apiKey: "show_image_hero", label: "Show image", fieldType: "boolean", defaultValue: false },
    {
      owner: "hero_section",
      apiKey: "image_hero",
      label: "Image",
      fieldType: "single_block",
      validators: (ids) => singleVal(ids, ["hero_image_block"]),
    },
    { owner: "hero_section", apiKey: "show_image_overlay", label: "Show overlay", fieldType: "boolean", defaultValue: false },
    {
      owner: "hero_section",
      apiKey: "image_overlay",
      label: "Overlay",
      fieldType: "single_block",
      validators: (ids) => singleVal(ids, ["hero_image_block"]),
    },

    {
      owner: "feature_grid",
      apiKey: "text_header_section",
      label: "Header",
      fieldType: "rich_text",
      validators: (ids) => richVal(ids, ["text_header"]),
    },
    { owner: "feature_grid", apiKey: "advanced_options", label: "Advanced options", fieldType: "boolean", defaultValue: false },
    { owner: "feature_grid", apiKey: "variant", label: "Variant", fieldType: "string" },
    {
      owner: "feature_grid",
      apiKey: "carousel_options",
      label: "Carousel",
      fieldType: "rich_text",
      validators: (ids) => richVal(ids, ["carousel_setting"]),
    },
    {
      owner: "feature_grid",
      apiKey: "items_feature_grid",
      label: "Items",
      fieldType: "rich_text",
      validators: (ids) => richVal(ids, ["card"]),
    },

    {
      owner: "faq_group",
      apiKey: "text_header_section",
      label: "Header",
      fieldType: "rich_text",
      validators: (ids) => richVal(ids, ["text_header"]),
    },
    { owner: "faq_group", apiKey: "advanced_options", label: "Advanced options", fieldType: "boolean", defaultValue: false },
    { owner: "faq_group", apiKey: "accordion_mode", label: "Accordion mode", fieldType: "string" },
    { owner: "faq_group", apiKey: "open_first_item", label: "Open first", fieldType: "boolean", defaultValue: false },
    { owner: "faq_group", apiKey: "enable_faq_schema", label: "FAQ schema", fieldType: "boolean", defaultValue: true },
    { owner: "faq_group", apiKey: "header_alignment", label: "Header alignment", fieldType: "string" },
    {
      owner: "faq_group",
      apiKey: "questions",
      label: "Questions",
      fieldType: "rich_text",
      validators: (ids) => richVal(ids, ["faq_item"]),
    },

    {
      owner: "cta_banner",
      apiKey: "text_header_section",
      label: "Header",
      fieldType: "rich_text",
      validators: (ids) => richVal(ids, ["text_header"]),
    },
    { owner: "cta_banner", apiKey: "advanced_options", label: "Advanced options", fieldType: "boolean", defaultValue: false },
    { owner: "cta_banner", apiKey: "variant", label: "Variant", fieldType: "string" },
    { owner: "cta_banner", apiKey: "bg_theme", label: "Background", fieldType: "string" },
    { owner: "cta_banner", apiKey: "has_eyebrow", label: "Has eyebrow", fieldType: "boolean", defaultValue: false },
    { owner: "cta_banner", apiKey: "eyebrow", label: "Eyebrow", fieldType: "string" },
    { owner: "cta_banner", apiKey: "has_image", label: "Has image", fieldType: "boolean", defaultValue: false },
    {
      owner: "cta_banner",
      apiKey: "image_banner",
      label: "Image",
      fieldType: "rich_text",
      validators: (ids) => richVal(ids, ["banner_image_block"]),
    },
    {
      owner: "cta_banner",
      apiKey: "buttons",
      label: "Buttons",
      fieldType: "rich_text",
      validators: (ids) => richVal(ids, ["link"]),
    },

    {
      owner: "logo_grid",
      apiKey: "text_header_section",
      label: "Header",
      fieldType: "rich_text",
      validators: (ids) => richVal(ids, ["text_header"]),
    },
    { owner: "logo_grid", apiKey: "grayscale", label: "Grayscale", fieldType: "boolean", defaultValue: false },
    { owner: "logo_grid", apiKey: "layout_style", label: "Layout", fieldType: "string" },
    {
      owner: "logo_grid",
      apiKey: "logos",
      label: "Logos",
      fieldType: "rich_text",
      validators: (ids) => richVal(ids, ["image_block"]),
    },

    {
      owner: "reviews_section",
      apiKey: "text_header_section",
      label: "Header",
      fieldType: "rich_text",
      validators: (ids) => richVal(ids, ["text_header"]),
    },
    { owner: "reviews_section", apiKey: "allow_submissions", label: "Allow submissions", fieldType: "boolean", defaultValue: false },
    {
      owner: "reviews_section",
      apiKey: "reviews",
      label: "Reviews",
      fieldType: "links",
      validators: (ids) => linksVal(ids, ["user_review"]),
    },

    {
      owner: "pricing_section",
      apiKey: "text_header_section",
      label: "Header",
      fieldType: "rich_text",
      validators: (ids) => richVal(ids, ["text_header"]),
    },
    {
      owner: "pricing_section",
      apiKey: "plans",
      label: "Plans",
      fieldType: "rich_text",
      validators: (ids) => richVal(ids, ["pricing_card"]),
    },

    {
      owner: "stats_section",
      apiKey: "text_header_section",
      label: "Header",
      fieldType: "rich_text",
      validators: (ids) => richVal(ids, ["text_header"]),
    },
    {
      owner: "stats_section",
      apiKey: "stats",
      label: "Stats",
      fieldType: "rich_text",
      validators: (ids) => richVal(ids, ["stat_card"]),
    },

    {
      owner: "steps_section",
      apiKey: "text_header_section",
      label: "Header",
      fieldType: "rich_text",
      validators: (ids) => richVal(ids, ["text_header"]),
    },
    {
      owner: "steps_section",
      apiKey: "steps",
      label: "Steps",
      fieldType: "rich_text",
      validators: (ids) => richVal(ids, ["step_card"]),
    },

    {
      owner: "tabs_section",
      apiKey: "text_header_section",
      label: "Header",
      fieldType: "rich_text",
      validators: (ids) => richVal(ids, ["text_header"]),
    },
    {
      owner: "tabs_section",
      apiKey: "tabs",
      label: "Tabs",
      fieldType: "rich_text",
      validators: (ids) => richVal(ids, ["tab_item"]),
    },

    {
      owner: "team_section",
      apiKey: "text_header_section",
      label: "Header",
      fieldType: "rich_text",
      validators: (ids) => richVal(ids, ["text_header"]),
    },
    {
      owner: "team_section",
      apiKey: "members",
      label: "Members",
      fieldType: "links",
      validators: (ids) => linksVal(ids, ["author"]),
    },

    {
      owner: "content_listing_section",
      apiKey: "text_header_section",
      label: "Header",
      fieldType: "rich_text",
      validators: (ids) => richVal(ids, ["text_header"]),
    },
    { owner: "content_listing_section", apiKey: "display_type", label: "Display", fieldType: "string" },
    { owner: "content_listing_section", apiKey: "has_limit", label: "Has limit", fieldType: "boolean", defaultValue: false },
    { owner: "content_listing_section", apiKey: "limit", label: "Limit", fieldType: "integer" },
    { owner: "content_listing_section", apiKey: "initial_count", label: "Initial count", fieldType: "integer" },
    { owner: "content_listing_section", apiKey: "load_more_step", label: "Load more step", fieldType: "integer" },
    { owner: "content_listing_section", apiKey: "load_more_label", label: "Load more label", fieldType: "string" },
    {
      owner: "content_listing_section",
      apiKey: "carousel_options",
      label: "Carousel",
      fieldType: "rich_text",
      validators: (ids) => richVal(ids, ["carousel_setting"]),
    },
    {
      owner: "content_listing_section",
      apiKey: "listing_config",
      label: "Listing config",
      fieldType: "single_block",
      validators: (ids) => singleVal(ids, ["blog_listing_config", "shopify_listing_config"]),
    },

    { owner: "text_section", apiKey: "has_text_header", label: "Has header", fieldType: "boolean", defaultValue: true },
    {
      owner: "text_section",
      apiKey: "text_header_section",
      label: "Header",
      fieldType: "rich_text",
      validators: (ids) => richVal(ids, ["text_header"]),
    },
    {
      owner: "text_section",
      apiKey: "body",
      label: "Body",
      fieldType: "structured_text",
      validators: (ids) =>
        stVal(ids, ["image_block", "image_gallery_block", "video_block"], ["page"]),
    },

    { owner: "contact_form_section", apiKey: "has_text_header", label: "Has header", fieldType: "boolean", defaultValue: true },
    {
      owner: "contact_form_section",
      apiKey: "text_header_section",
      label: "Header",
      fieldType: "rich_text",
      validators: (ids) => richVal(ids, ["text_header"]),
    },
    {
      owner: "contact_form_section",
      apiKey: "intro",
      label: "Intro",
      fieldType: "structured_text",
      validators: (ids) => stVal(ids, [], ["page"]),
    },
    { owner: "contact_form_section", apiKey: "privacy_note", label: "Privacy note", fieldType: "string" },
    { owner: "contact_form_section", apiKey: "success_message", label: "Success message", fieldType: "string" },

    { owner: "search_section", apiKey: "has_text_header", label: "Has header", fieldType: "boolean", defaultValue: true },
    {
      owner: "search_section",
      apiKey: "text_header_section",
      label: "Header",
      fieldType: "rich_text",
      validators: (ids) => richVal(ids, ["text_header"]),
    },
    {
      owner: "search_section",
      apiKey: "intro",
      label: "Intro",
      fieldType: "structured_text",
      validators: (ids) => stVal(ids, [], ["page"]),
    },
    { owner: "search_section", apiKey: "placeholder", label: "Placeholder", fieldType: "string" },
    { owner: "search_section", apiKey: "submit_label", label: "Submit", fieldType: "string" },
    { owner: "search_section", apiKey: "empty_hint", label: "Empty hint", fieldType: "string" },
    { owner: "search_section", apiKey: "no_results", label: "No results", fieldType: "string" },

    { owner: "page", apiKey: "title", label: "Title", fieldType: "string", localized: true },
    {
      owner: "page",
      apiKey: "slug",
      label: "Slug",
      fieldType: "slug",
      localized: true,
      validators: () => ({ slug_format: { predefined_pattern: "webpage_slug" } }),
    },
    {
      owner: "page",
      apiKey: "hero_page",
      label: "Hero",
      fieldType: "single_block",
      localized: true,
      validators: (ids) => singleVal(ids, ["hero_section"]),
    },
    {
      owner: "page",
      apiKey: "content_page",
      label: "Content",
      fieldType: "rich_text",
      localized: true,
      validators: (ids) =>
        richVal(ids, [
          "contact_form_section",
          "content_listing_section",
          "cta_banner",
          "faq_group",
          "feature_grid",
          "logo_grid",
          "pricing_section",
          "reviews_section",
          "search_section",
          "stats_section",
          "steps_section",
          "tabs_section",
          "team_section",
          "text_section",
        ]),
    },
    { owner: "page", apiKey: "seo_settings_social", label: "SEO", fieldType: "seo", localized: true },
    { owner: "page", apiKey: "seo_analysis", label: "SEO analysis", fieldType: "json", localized: true },

    { owner: "post", apiKey: "post_title", label: "Title", fieldType: "string", localized: true },
    {
      owner: "post",
      apiKey: "post_slug",
      label: "Slug",
      fieldType: "slug",
      localized: true,
      validators: () => ({ slug_format: { predefined_pattern: "webpage_slug" } }),
    },
    { owner: "post", apiKey: "excerpt", label: "Excerpt", fieldType: "text", localized: true },
    {
      owner: "post",
      apiKey: "cover_image",
      label: "Cover",
      fieldType: "single_block",
      validators: (ids) => singleVal(ids, ["card_image_block"]),
    },
    {
      owner: "post",
      apiKey: "post_author",
      label: "Author",
      fieldType: "link",
      validators: (ids) => linkVal(ids, ["author"]),
    },
    {
      owner: "post",
      apiKey: "post_category",
      label: "Categories",
      fieldType: "links",
      validators: (ids) => linksVal(ids, ["category"]),
    },
    {
      owner: "post",
      apiKey: "post_content",
      label: "Content",
      fieldType: "structured_text",
      localized: true,
      validators: (ids) =>
        stVal(ids, ["content_listing_section", "image_block", "image_gallery_block", "video_block"], ["page"]),
    },
    { owner: "post", apiKey: "seo_settings_social", label: "SEO", fieldType: "seo", localized: true },
    { owner: "post", apiKey: "seo_analysis", label: "SEO analysis", fieldType: "json", localized: true },

    { owner: "author", apiKey: "author_name", label: "Name", fieldType: "string" },
    { owner: "author", apiKey: "author_role", label: "Role", fieldType: "string" },
    {
      owner: "author",
      apiKey: "author_slug",
      label: "Slug",
      fieldType: "slug",
      localized: true,
      validators: () => ({ slug_format: { predefined_pattern: "webpage_slug" } }),
    },
    {
      owner: "author",
      apiKey: "author_bio",
      label: "Bio",
      fieldType: "structured_text",
      localized: true,
      validators: (ids) => stVal(ids, [], []),
    },
    {
      owner: "author",
      apiKey: "avatar_bio",
      label: "Avatar",
      fieldType: "single_block",
      validators: (ids) => singleVal(ids, ["image_block"]),
    },
    {
      owner: "author",
      apiKey: "author_social_links",
      label: "Social",
      fieldType: "rich_text",
      validators: (ids) => richVal(ids, ["social_link"]),
    },
    { owner: "author", apiKey: "seo_settings_social", label: "SEO", fieldType: "seo" },
    { owner: "author", apiKey: "seo_analysis", label: "SEO analysis", fieldType: "json", localized: true },

    { owner: "category", apiKey: "category_name", label: "Name", fieldType: "string", localized: true },
    {
      owner: "category",
      apiKey: "category_slug",
      label: "Slug",
      fieldType: "slug",
      localized: true,
      validators: () => ({ slug_format: { predefined_pattern: "webpage_slug" } }),
    },
    {
      owner: "category",
      apiKey: "category_description",
      label: "Description",
      fieldType: "structured_text",
      localized: true,
      validators: (ids) => stVal(ids, [], []),
    },
    { owner: "category", apiKey: "category_color", label: "Color", fieldType: "color" },
    { owner: "category", apiKey: "category_icon", label: "Icon", fieldType: "file", validators: () => fileValidators(false) },
    { owner: "category", apiKey: "seo_settings_social", label: "SEO", fieldType: "seo" },
    { owner: "category", apiKey: "seo_analysis", label: "SEO analysis", fieldType: "json", localized: true },

    { owner: "legal_page", apiKey: "title", label: "Title", fieldType: "string", localized: true },
    { owner: "legal_page", apiKey: "slug", label: "Slug", fieldType: "string" },
    {
      owner: "legal_page",
      apiKey: "content",
      label: "Content",
      fieldType: "structured_text",
      localized: true,
      validators: (ids) => stVal(ids, [], ["legal_page", "page"]),
    },
    { owner: "legal_page", apiKey: "seo_settings_social", label: "SEO", fieldType: "seo", localized: true },
    { owner: "legal_page", apiKey: "seo_analysis", label: "SEO analysis", fieldType: "json", localized: true },

    { owner: "product_page", apiKey: "title", label: "Title", fieldType: "string", localized: true },
    { owner: "product_page", apiKey: "description", label: "Description", fieldType: "text", localized: true },
    { owner: "product_page", apiKey: "shopify_handle", label: "Shopify handle", fieldType: "string" },
    { owner: "product_page", apiKey: "shopify_product_id", label: "Shopify product id", fieldType: "string" },
    { owner: "product_page", apiKey: "seo", label: "SEO", fieldType: "seo", localized: true },

    { owner: "collection_page", apiKey: "title", label: "Title", fieldType: "string", localized: true },
    { owner: "collection_page", apiKey: "description", label: "Description", fieldType: "text", localized: true },
    { owner: "collection_page", apiKey: "shopify_handle", label: "Shopify handle", fieldType: "string" },
    { owner: "collection_page", apiKey: "shopify_collection_id", label: "Shopify collection id", fieldType: "string" },
    { owner: "collection_page", apiKey: "seo", label: "SEO", fieldType: "seo", localized: true },

    { owner: "redirect", apiKey: "from_path_redirect", label: "From", fieldType: "string" },
    { owner: "redirect", apiKey: "to_path_redirect", label: "To", fieldType: "string" },
    { owner: "redirect", apiKey: "status_redirect", label: "Status", fieldType: "string", defaultValue: "301" },

    { owner: "user_review", apiKey: "author_name", label: "Author", fieldType: "string", localized: true },
    { owner: "user_review", apiKey: "author_email", label: "Email", fieldType: "string" },
    { owner: "user_review", apiKey: "author_avatar", label: "Avatar", fieldType: "file", validators: () => fileValidators(false) },
    { owner: "user_review", apiKey: "comment", label: "Comment", fieldType: "text", localized: true },
    { owner: "user_review", apiKey: "rating", label: "Rating", fieldType: "integer" },

    {
      owner: "global_setting",
      apiKey: "blog_page",
      label: "Blog page",
      fieldType: "link",
      validators: (ids) => linkVal(ids, ["page"]),
    },
    {
      owner: "global_setting",
      apiKey: "collections_page",
      label: "Collections page",
      fieldType: "link",
      validators: (ids) => linkVal(ids, ["page"]),
    },
    {
      owner: "global_setting",
      apiKey: "contact_page",
      label: "Contact page",
      fieldType: "link",
      validators: (ids) => linkVal(ids, ["page"]),
    },
    {
      owner: "global_setting",
      apiKey: "products_page",
      label: "Products page",
      fieldType: "link",
      validators: (ids) => linkVal(ids, ["page"]),
    },
    {
      owner: "global_setting",
      apiKey: "search_page",
      label: "Search page",
      fieldType: "link",
      validators: (ids) => linkVal(ids, ["page"]),
    },
    { owner: "global_setting", apiKey: "title_404", label: "404 title", fieldType: "string", localized: true },
    {
      owner: "global_setting",
      apiKey: "description_404",
      label: "404 description",
      fieldType: "structured_text",
      localized: true,
      validators: (ids) => stVal(ids, [], []),
    },
    {
      owner: "global_setting",
      apiKey: "image_404",
      label: "404 image",
      fieldType: "single_block",
      validators: (ids) => singleVal(ids, ["image_block"]),
    },

    { owner: "navigation", apiKey: "logo", label: "Logo", fieldType: "file", validators: () => fileValidators(false) },
    { owner: "navigation", apiKey: "footer_logo", label: "Footer logo", fieldType: "file", validators: () => fileValidators(false) },
    { owner: "navigation", apiKey: "default_theme", label: "Default theme", fieldType: "string" },
    { owner: "navigation", apiKey: "show_theme_toggle", label: "Theme toggle", fieldType: "boolean", defaultValue: true },
    { owner: "navigation", apiKey: "show_header_search", label: "Header search", fieldType: "boolean", defaultValue: false },
    {
      owner: "navigation",
      apiKey: "header_search_placeholder",
      label: "Search placeholder",
      fieldType: "string",
      localized: true,
    },
    {
      owner: "navigation",
      apiKey: "header_search_submit_label",
      label: "Search submit",
      fieldType: "string",
      localized: true,
    },
    {
      owner: "navigation",
      apiKey: "copyright_text",
      label: "Copyright",
      fieldType: "structured_text",
      localized: true,
      validators: (ids) => stVal(ids, [], []),
    },
    {
      owner: "navigation",
      apiKey: "menu_links",
      label: "Menu",
      fieldType: "rich_text",
      localized: true,
      validators: (ids) => richVal(ids, ["nav_item_modular"]),
    },
    {
      owner: "navigation",
      apiKey: "footer_menu",
      label: "Footer menu",
      fieldType: "rich_text",
      localized: true,
      validators: (ids) => richVal(ids, ["nav_item_modular"]),
    },
    {
      owner: "navigation",
      apiKey: "legal_links",
      label: "Legal links",
      fieldType: "rich_text",
      localized: true,
      validators: (ids) => richVal(ids, ["nav_item_simple"]),
    },
    {
      owner: "navigation",
      apiKey: "social_links",
      label: "Social",
      fieldType: "rich_text",
      localized: true,
      validators: (ids) => richVal(ids, ["social_link"]),
    },
  ];
}

async function ensureItemType(client: Client, spec: ItemKind): Promise<string> {
  try {
    const existing = await client.itemTypes.find(spec.apiKey);
    console.log(`  exists ${spec.apiKey}`);
    return existing.id;
  } catch {
    const created = spec.modular
      ? await client.itemTypes.create({
          name: spec.name,
          api_key: spec.apiKey,
          modular_block: true,
        })
      : await client.itemTypes.create({
          name: spec.name,
          api_key: spec.apiKey,
          modular_block: false,
          singleton: spec.singleton ?? false,
          draft_mode_active: spec.draft ?? false,
        });
    console.log(`  created ${spec.apiKey}`);
    return created.id;
  }
}

async function fieldExists(client: Client, pointer: string): Promise<boolean> {
  try {
    await client.fields.find(pointer);
    return true;
  } catch {
    return false;
  }
}

function defaultFor(spec: FieldSpec): string | boolean | number | null | Record<string, string | boolean | number | null> | undefined {
  if (spec.defaultValue === undefined) return undefined;
  if (spec.localized) {
    return { en: spec.defaultValue };
  }
  return spec.defaultValue;
}

async function ensureField(client: Client, ids: IdMap, spec: FieldSpec): Promise<void> {
  const pointer = `${spec.owner}::${spec.apiKey}`;
  if (await fieldExists(client, pointer)) {
    console.log(`  field exists ${pointer}`);
    return;
  }
  const ownerId = must(ids, spec.owner);
  const localized = spec.localized ?? false;
  const dv = defaultFor(spec);
  try {
    await client.fields.create(ownerId, {
      label: spec.label,
      api_key: spec.apiKey,
      field_type: spec.fieldType,
      localized,
      validators: spec.validators ? spec.validators(ids) : {},
      ...(spec.hint ? { hint: spec.hint } : {}),
      ...(dv === undefined ? {} : { default_value: dv }),
    } as ApiTypes.FieldCreateSchema);
    console.log(`  field created ${pointer}`);
  } catch (error) {
    if (error instanceof ApiError && error.response.status === 422) {
      console.log(`  field exists (422) ${pointer}`);
      return;
    }
    throw error;
  }
}

async function wireTitleFields(client: Client, ids: IdMap): Promise<void> {
  for (const [model, fieldApiKey] of Object.entries(TITLE_FIELDS)) {
    const pointer = `${model}::${fieldApiKey}`;
    try {
      const field = await client.fields.find(pointer);
      await client.itemTypes.update(must(ids, model), {
        title_field: { id: field.id, type: "field" },
      });
      console.log(`  title_field ${pointer}`);
    } catch (error) {
      console.log(`  skip title_field ${pointer}: ${String(error)}`);
    }
  }
}

async function wireSlugs(client: Client): Promise<void> {
  const pairs: Array<[string, string]> = [
    ["page::slug", "page::title"],
    ["post::post_slug", "post::post_title"],
    ["author::author_slug", "author::author_name"],
    ["category::category_slug", "category::category_name"],
  ];
  for (const [slugPointer, titlePointer] of pairs) {
    try {
      const slug = await client.fields.find(slugPointer);
      const title = await client.fields.find(titlePointer);
      await client.fields.update(slug.id, {
        validators: {
          slug_title_field: { title_field_id: title.id },
          slug_format: { predefined_pattern: "webpage_slug" },
        },
      });
      console.log(`  slug ${slugPointer}`);
    } catch (error) {
      console.log(`  skip slug ${slugPointer}: ${String(error)}`);
    }
  }
}

async function seedMigrations(client: Client, ids: IdMap): Promise<void> {
  const dir = join(process.cwd(), "migrations");
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".ts") || f.endsWith(".js"))
    .sort();
  for (const file of files) {
    try {
      await client.items.create({
        item_type: { type: "item_type", id: must(ids, "schema_migration") },
        name: file,
      });
      console.log(`  recorded migration ${file}`);
    } catch {
      console.log(`  migration already recorded ${file}`);
    }
  }
}

export default async function bootstrapStagingSchema(client: Client): Promise<void> {
  const site = await client.site.find();
  console.log(`Bootstrapping schema on site ${site.id} (${site.name})`);
  if (site.id === "201057") {
    throw new Error("Refusing to bootstrap production site 201057");
  }

  const currentLocales = site.locales ?? [];
  console.log(`Locales: ${currentLocales.join(", ") || "(none)"}`);
  if (currentLocales.length === 0) {
    throw new Error("Site has no locales");
  }
  // Adding locales on a fresh Free project often 422s; CDA still works with the
  // existing locale (typically `en`) plus query fallbacks.

  const ids: IdMap = new Map();
  console.log("Item types…");
  for (const spec of [...BLOCKS, ...MODELS]) {
    ids.set(spec.apiKey, await ensureItemType(client, spec));
  }

  console.log("Fields…");
  for (const spec of fields()) {
    await ensureField(client, ids, spec);
  }

  console.log("Title fields + slugs…");
  await wireTitleFields(client, ids);
  await wireSlugs(client);

  console.log("Mark existing repo migrations as applied…");
  await seedMigrations(client, ids);

  console.log("Staging schema bootstrap complete.");
}
