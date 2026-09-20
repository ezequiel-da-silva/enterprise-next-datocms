/**
 * Opções partilhadas por Content listing section.
 *
 * `listing_config` é um single block Blog/Shopify. O tipo do bloco define a
 * fonte; cada filho contém apenas aquisição e filtros do próprio domínio.
 * `display_type`: grid (default) | carousel | pagination | load_more
 */
import { readCdaBool, readCdaString, readCdaStringForLogic } from "@/lib/datocms/cda-field";
import { resolveCarouselSetting, type CarouselSetting } from "@/lib/datocms/resolve-carousel-setting";

export type ContentListingSource = "blog" | "shopify";
export type ContentListingFetchMode = "auto" | "manual";
export type ContentListingDisplayType = "grid" | "carousel" | "pagination" | "load_more";
export type ContentListingFilterDisplay = "all" | "selected" | "none";
export type BlogPostSelection = "all_categories" | "selected_categories" | "no_categories" | "manual";
export type ShopifyProductSelection = "all_products" | "collection" | "manual";
export type ContentListingMode =
  | "blog_auto_all"
  | "blog_auto_selected"
  | "blog_auto_none"
  | "blog_manual"
  | "shopify_auto_all"
  | "shopify_auto_collection"
  | "shopify_manual";

export type ContentListingOptions = {
  contentSource: ContentListingSource;
  fetchMode: ContentListingFetchMode;
  hasLimit: boolean;
  limit: number;
  displayType: ContentListingDisplayType;
  initialCount: number;
  loadMoreStep: number;
  loadMoreLabel: string;
  carousel: CarouselSetting;
};

export const CONTENT_LISTING_DEFAULTS = {
  contentSource: "blog",
  fetchMode: "auto",
  filterDisplay: "all",
  hasLimit: false,
  limit: 6,
  displayType: "grid",
  initialCount: 6,
  loadMoreStep: 3,
} as const satisfies Omit<ContentListingOptions, "loadMoreLabel" | "carousel"> & {
  filterDisplay: ContentListingFilterDisplay;
};

const MIN_COUNT = 1;
const MAX_COUNT = 100;

function optionalNumber(record: Record<string, unknown>, camel: string, snake: string): number | undefined {
  const raw = record[camel] ?? record[snake];
  const value = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw) : Number.NaN;
  return Number.isFinite(value) ? value : undefined;
}

function clampCount(value: number | undefined, fallback: number): number {
  if (value == null) return fallback;
  return Math.min(MAX_COUNT, Math.max(MIN_COUNT, Math.round(value)));
}

const LISTING_MODES = new Set<ContentListingMode>([
  "blog_auto_all",
  "blog_auto_selected",
  "blog_auto_none",
  "blog_manual",
  "shopify_auto_all",
  "shopify_auto_collection",
  "shopify_manual",
]);

function contentSource(raw: string): ContentListingSource {
  return raw.trim().toLowerCase().includes("shop") ? "shopify" : "blog";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

export function readContentListingConfig(
  record: Record<string, unknown>,
): Record<string, unknown> | null {
  const raw = record.listingConfig ?? record.listing_config;
  if (isRecord(raw)) return raw;
  if (Array.isArray(raw) && isRecord(raw[0])) return raw[0];
  return null;
}

function configType(record: Record<string, unknown>): string {
  const config = readContentListingConfig(record);
  return typeof config?.__typename === "string" ? config.__typename : "";
}

function configOrLegacy(record: Record<string, unknown>): Record<string, unknown> {
  return readContentListingConfig(record) ?? record;
}

function legacyFetchMode(raw: string): ContentListingFetchMode {
  const value = raw.trim().toLowerCase();
  return value.includes("manual") || value.includes("curad") ? "manual" : "auto";
}

function legacyFilterDisplay(raw: string): ContentListingFilterDisplay {
  const value = raw.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (value === "none" || value.includes("none") || value.includes("nenhum") || value.includes("ocult")) {
    return "none";
  }
  if (
    value === "selected" ||
    value.includes("selected") ||
    value.includes("selecion") ||
    value.includes("escolhid")
  ) {
    return "selected";
  }
  return "all";
}

function readLegacyContentListingMode(record: Record<string, unknown>): ContentListingMode {
  const raw = readCdaStringForLogic(record, "listingMode", "listing_mode").trim().toLowerCase();
  if (LISTING_MODES.has(raw as ContentListingMode)) return raw as ContentListingMode;

  // Compatibilidade com payloads anteriores às duas migrations de configuração.
  const sourceRaw = readCdaStringForLogic(record, "contentSource", "content_source");
  const fetchRaw = readCdaStringForLogic(record, "fetchMode", "fetch_mode");
  const filterRaw = readCdaStringForLogic(record, "categoryDisplay", "category_display");
  const source = sourceRaw ? contentSource(sourceRaw) : CONTENT_LISTING_DEFAULTS.contentSource;
  const fetch = fetchRaw ? legacyFetchMode(fetchRaw) : CONTENT_LISTING_DEFAULTS.fetchMode;
  const filter = filterRaw ? legacyFilterDisplay(filterRaw) : CONTENT_LISTING_DEFAULTS.filterDisplay;
  if (source === "shopify") {
    if (fetch === "manual") return "shopify_manual";
    return filter === "selected" ? "shopify_auto_collection" : "shopify_auto_all";
  }
  if (fetch === "manual") return "blog_manual";
  if (filter === "selected") return "blog_auto_selected";
  if (filter === "none") return "blog_auto_none";
  return "blog_auto_all";
}

export function readContentListingMode(record: Record<string, unknown>): ContentListingMode {
  const source = readContentListingSource(record);
  if (source === "shopify") {
    const selection = readShopifyProductSelection(record);
    if (selection === "manual") return "shopify_manual";
    if (selection === "collection") return "shopify_auto_collection";
    return "shopify_auto_all";
  }

  const selection = readBlogPostSelection(record);
  if (selection === "manual") return "blog_manual";
  if (selection === "selected_categories") return "blog_auto_selected";
  if (selection === "no_categories") return "blog_auto_none";
  return "blog_auto_all";
}

export function readContentListingFilterDisplay(record: Record<string, unknown>): ContentListingFilterDisplay {
  const config = readContentListingConfig(record);
  if (configType(record) === "BlogListingConfigRecord") {
    const raw = readCdaStringForLogic(config ?? {}, "filterDisplay", "filter_display");
    return raw === "selected" || raw === "none" ? raw : "all";
  }
  if (configType(record) === "ShopifyListingConfigRecord") {
    return readShopifyCollectionFilter(config ?? {});
  }
  if (readContentListingSource(record) === "shopify") {
    return readShopifyProductSelection(record) === "collection" ? "selected" : "all";
  }
  const selection = readBlogPostSelection(record);
  if (selection === "selected_categories") return "selected";
  if (selection === "no_categories") return "none";
  return "all";
}

function displayType(raw: string): ContentListingDisplayType {
  const value = raw.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (value === "carousel" || value.includes("carross") || value.includes("carrus")) return "carousel";
  if (value === "pagination" || value.includes("pagin")) return "pagination";
  if (value === "load_more" || value.includes("load") || value.includes("carregar")) return "load_more";
  return "grid";
}

export function readContentListingSource(record: Record<string, unknown>): ContentListingSource {
  const typename = configType(record);
  if (typename === "ShopifyListingConfigRecord") return "shopify";
  if (typename === "BlogListingConfigRecord") return "blog";
  const raw = readCdaStringForLogic(record, "contentSource", "content_source").trim().toLowerCase();
  if (raw === "blog" || raw === "shopify") return raw;
  const legacyMode = readCdaStringForLogic(record, "listingMode", "listing_mode").trim().toLowerCase();
  if (LISTING_MODES.has(legacyMode as ContentListingMode)) {
    return legacyMode.startsWith("shopify_") ? "shopify" : "blog";
  }
  return raw ? contentSource(raw) : CONTENT_LISTING_DEFAULTS.contentSource;
}

export function readBlogPostSelection(record: Record<string, unknown>): BlogPostSelection {
  const config = readContentListingConfig(record);
  if (configType(record) === "BlogListingConfigRecord" && config) {
    const fetch = readCdaStringForLogic(config, "fetchMode", "fetch_mode");
    if (fetch === "manual") return "manual";
    const filter = readCdaStringForLogic(config, "filterDisplay", "filter_display");
    if (filter === "selected") return "selected_categories";
    if (filter === "none") return "no_categories";
    return "all_categories";
  }
  const raw = readCdaStringForLogic(record, "blogPostSelection", "blog_post_selection")
    .trim()
    .toLowerCase();
  if (
    raw === "all_categories" ||
    raw === "selected_categories" ||
    raw === "no_categories" ||
    raw === "manual"
  ) {
    return raw;
  }
  const legacy = readLegacyContentListingMode(record);
  if (legacy === "blog_auto_selected") return "selected_categories";
  if (legacy === "blog_auto_none") return "no_categories";
  if (legacy === "blog_manual") return "manual";
  return "all_categories";
}

function shopifyHasCollection(config: Record<string, unknown>): boolean {
  return Boolean(config.sourceCollection ?? config.source_collection);
}

/** Shopify `collection_filter`: selected vs all. Fallback: filled collection link = selected. */
function readShopifyCollectionFilter(config: Record<string, unknown>): ContentListingFilterDisplay {
  const raw = readCdaStringForLogic(config, "collectionFilter", "collection_filter")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  if (raw === "selected" || raw.includes("selected")) return "selected";
  if (raw === "all" || raw.startsWith("all_")) return "all";
  return shopifyHasCollection(config) ? "selected" : "all";
}

export function readShopifyProductSelection(record: Record<string, unknown>): ShopifyProductSelection {
  const config = readContentListingConfig(record);
  if (configType(record) === "ShopifyListingConfigRecord" && config) {
    const fetch = readCdaStringForLogic(config, "fetchMode", "fetch_mode");
    if (fetch === "manual") return "manual";
    return readShopifyCollectionFilter(config) === "selected" ? "collection" : "all_products";
  }
  const raw = readCdaStringForLogic(
    record,
    "shopifyProductSelection",
    "shopify_product_selection",
  )
    .trim()
    .toLowerCase();
  if (raw === "all_products" || raw === "collection" || raw === "manual") return raw;
  const legacy = readLegacyContentListingMode(record);
  if (legacy === "shopify_auto_collection") return "collection";
  if (legacy === "shopify_manual") return "manual";
  return "all_products";
}

export function resolveContentListingOptions(
  record: Record<string, unknown>,
  fallbackLoadMoreLabel: string,
): ContentListingOptions {
  const displayRaw = readCdaStringForLogic(record, "displayType", "display_type");
  const loadMoreLabel = readCdaString(record, "loadMoreLabel", "load_more_label");
  const contentSourceValue = readContentListingSource(record);
  const config = configOrLegacy(record);
  const directFetch = readCdaStringForLogic(config, "fetchMode", "fetch_mode");
  const fetchMode =
    directFetch === "manual" ||
    (!directFetch &&
      (contentSourceValue === "blog"
        ? readBlogPostSelection(record)
        : readShopifyProductSelection(record)) === "manual")
      ? "manual"
      : "auto";

  return {
    contentSource: contentSourceValue,
    fetchMode,
    hasLimit: readCdaBool(record, "hasLimit", "has_limit"),
    limit: clampCount(optionalNumber(record, "limit", "limit"), CONTENT_LISTING_DEFAULTS.limit),
    displayType: displayRaw ? displayType(displayRaw) : CONTENT_LISTING_DEFAULTS.displayType,
    initialCount: clampCount(
      optionalNumber(record, "initialCount", "initial_count"),
      CONTENT_LISTING_DEFAULTS.initialCount,
    ),
    loadMoreStep: clampCount(
      optionalNumber(record, "loadMoreStep", "load_more_step"),
      CONTENT_LISTING_DEFAULTS.loadMoreStep,
    ),
    loadMoreLabel: loadMoreLabel || fallbackLoadMoreLabel,
    carousel: resolveCarouselSetting(record.carouselOptions ?? record.carousel_options),
  };
}
