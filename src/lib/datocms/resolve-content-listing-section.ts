/**
 * Opções partilhadas por Content listing section.
 *
 * `content_source`: blog (default para compatibilidade) | shopify
 * `fetch_mode`: auto (default) | manual
 * `display_type`: grid (default) | carousel | pagination | load_more
 */
import { readCdaBool, readCdaString, readCdaStringForLogic } from "@/lib/datocms/cda-field";
import { resolveCarouselSetting, type CarouselSetting } from "@/lib/datocms/resolve-carousel-setting";

export type ContentListingSource = "blog" | "shopify";
export type ContentListingFetchMode = "auto" | "manual";
export type ContentListingDisplayType = "grid" | "carousel" | "pagination" | "load_more";
export type ContentListingFilterDisplay = "all" | "selected" | "none";

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

function contentSource(raw: string): ContentListingSource {
  return raw.trim().toLowerCase().includes("shop") ? "shopify" : "blog";
}

function fetchMode(raw: string): ContentListingFetchMode {
  const value = raw.trim().toLowerCase();
  return value.includes("manual") || value.includes("curad") ? "manual" : "auto";
}

function filterDisplay(raw: string): ContentListingFilterDisplay {
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

export function readContentListingFilterDisplay(record: Record<string, unknown>): ContentListingFilterDisplay {
  const raw = readCdaStringForLogic(record, "categoryDisplay", "category_display");
  return raw ? filterDisplay(raw) : CONTENT_LISTING_DEFAULTS.filterDisplay;
}

function displayType(raw: string): ContentListingDisplayType {
  const value = raw.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (value === "carousel" || value.includes("carross") || value.includes("carrus")) return "carousel";
  if (value === "pagination" || value.includes("pagin")) return "pagination";
  if (value === "load_more" || value.includes("load") || value.includes("carregar")) return "load_more";
  return "grid";
}

export function readContentListingSource(record: Record<string, unknown>): ContentListingSource {
  const raw = readCdaStringForLogic(record, "contentSource", "content_source");
  return raw ? contentSource(raw) : CONTENT_LISTING_DEFAULTS.contentSource;
}

export function resolveContentListingOptions(
  record: Record<string, unknown>,
  fallbackLoadMoreLabel: string,
): ContentListingOptions {
  const fetchRaw = readCdaStringForLogic(record, "fetchMode", "fetch_mode");
  const displayRaw = readCdaStringForLogic(record, "displayType", "display_type");
  const loadMoreLabel = readCdaString(record, "loadMoreLabel", "load_more_label");

  return {
    contentSource: readContentListingSource(record),
    fetchMode: fetchRaw ? fetchMode(fetchRaw) : CONTENT_LISTING_DEFAULTS.fetchMode,
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
