/**
 * Blog posts section (`blog_posts_section`).
 *
 * | Campo                 | API key                | Default                         |
 * |-----------------------|------------------------|---------------------------------|
 * | fetch_mode            | fetch_mode             | auto                            |
 * | category_display      | category_display       | all                             |
 * | show_sort_tabs        | show_sort_tabs         | true (só `false` explícito off) |
 * | has_limit             | has_limit              | false — `limit` só aplica se true |
 * | limit                 | limit                  | 6 (clamp 1–100)                 |
 * | display_type          | display_type           | grid                            |
 * | initial_count         | initial_count          | 6 — só paginação / load more    |
 * | load_more_step        | load_more_step          | 3 (clamp 1–100)                 |
 * | load_more_label       | load_more_label         | copy i18n se vazio              |
 * | carousel_options      | carousel_options        | defaults de `carousel_setting`  |
 * | section_id            | section_id             | —                               |
 * | all_categories_label  | all_categories_label   | copy i18n se vazio              |
 *
 * Display:
 * - `grid` / `carousel` — mostram o dataset filtrado. O teto é só `has_limit`
 *   (`limit`); `initial_count` não corta.
 * - `pagination` — páginas de `initial_count`.
 * - `load_more` — começa em `initial_count`, depois `load_more_step`.
 *
 * Ordenação “Populares”: `_updatedAt_DESC` (proxy editorial). Sem pageviews no
 * CDA. Follow-up: integer `view_count` via Plausible/GA4/Vercel Analytics.
 */
import type { PostCardRecord, PostCategorySummary } from "@/infra/datocms/types-blog";
import { readCdaArray, readCdaBool, readCdaString, readCdaStringForLogic } from "@/lib/datocms/cda-field";
import { resolveCarouselSetting, type CarouselSetting } from "@/lib/datocms/resolve-carousel-setting";

export type LatestPostsFetchMode = "auto" | "manual";
export type LatestPostsCategoryDisplay = "all" | "selected" | "none";
export type LatestPostsSort = "newest" | "oldest" | "popular";
export type BlogPostsDisplayType = "grid" | "carousel" | "pagination" | "load_more";

export type LatestPostsOptions = {
  fetchMode: LatestPostsFetchMode;
  categoryDisplay: LatestPostsCategoryDisplay;
  showSortTabs: boolean;
  hasLimit: boolean;
  limit: number;
  displayType: BlogPostsDisplayType;
  initialCount: number;
  loadMoreStep: number;
  loadMoreLabel: string;
  carousel: CarouselSetting;
  sectionId?: string;
  allCategoriesLabel: string;
};

export const LATEST_POSTS_DEFAULTS = {
  fetchMode: "auto",
  categoryDisplay: "all",
  showSortTabs: true,
  hasLimit: false,
  limit: 6,
  displayType: "grid",
  initialCount: 6,
  loadMoreStep: 3,
} as const satisfies Pick<
  LatestPostsOptions,
  | "fetchMode"
  | "categoryDisplay"
  | "showSortTabs"
  | "hasLimit"
  | "limit"
  | "displayType"
  | "initialCount"
  | "loadMoreStep"
>;

const MIN_LIMIT = 1;
const MAX_LIMIT = 100;

function readOptionalBool(record: Record<string, unknown>, camel: string, snake: string): boolean | undefined {
  const raw = record[camel] ?? record[snake];
  if (raw === true) return true;
  if (raw === false) return false;
  return undefined;
}

function readOptionalNumber(record: Record<string, unknown>, camel: string, snake: string): number | undefined {
  const raw = record[camel] ?? record[snake];
  const value = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw) : Number.NaN;
  return Number.isFinite(value) ? value : undefined;
}

function clampCount(value: number | undefined, fallback: number): number {
  if (value == null) return fallback;
  return Math.min(MAX_LIMIT, Math.max(MIN_LIMIT, Math.round(value)));
}

function parseDisplayType(raw: string): BlogPostsDisplayType {
  const value = raw.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (value === "carousel" || value.includes("carross") || value.includes("carrus")) return "carousel";
  if (value === "pagination" || value.includes("pagin")) return "pagination";
  if (value === "load_more" || value.includes("load") || value.includes("carregar")) return "load_more";
  return "grid";
}

function sanitizeSectionId(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const slug = raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || undefined;
}

function parseFetchMode(raw: string): LatestPostsFetchMode {
  const value = raw.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (value === "manual" || value.includes("manual") || value.includes("curad")) {
    return "manual";
  }
  return "auto";
}

function parseCategoryDisplay(raw: string): LatestPostsCategoryDisplay {
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

export function resolveLatestPostsOptions(
  record: Record<string, unknown>,
  fallbackAllLabel: string,
  fallbackLoadMoreLabel = "Load more posts",
): LatestPostsOptions {
  const fetchRaw = readCdaStringForLogic(record, "fetchMode", "fetch_mode");
  const displayRaw = readCdaStringForLogic(record, "categoryDisplay", "category_display");
  const cmsAllLabel = readCdaString(record, "allCategoriesLabel", "all_categories_label");
  const displayTypeRaw = readCdaStringForLogic(record, "displayType", "display_type");
  const loadMoreLabel = readCdaString(record, "loadMoreLabel", "load_more_label");

  return {
    fetchMode: fetchRaw ? parseFetchMode(fetchRaw) : LATEST_POSTS_DEFAULTS.fetchMode,
    categoryDisplay: displayRaw ? parseCategoryDisplay(displayRaw) : LATEST_POSTS_DEFAULTS.categoryDisplay,
    showSortTabs: readOptionalBool(record, "showSortTabs", "show_sort_tabs") ?? LATEST_POSTS_DEFAULTS.showSortTabs,
    hasLimit: readCdaBool(record, "hasLimit", "has_limit"),
    limit: clampCount(readOptionalNumber(record, "limit", "limit"), LATEST_POSTS_DEFAULTS.limit),
    displayType: displayTypeRaw ? parseDisplayType(displayTypeRaw) : LATEST_POSTS_DEFAULTS.displayType,
    initialCount: clampCount(
      readOptionalNumber(record, "initialCount", "initial_count"),
      LATEST_POSTS_DEFAULTS.initialCount,
    ),
    loadMoreStep: clampCount(
      readOptionalNumber(record, "loadMoreStep", "load_more_step"),
      LATEST_POSTS_DEFAULTS.loadMoreStep,
    ),
    loadMoreLabel: loadMoreLabel || fallbackLoadMoreLabel,
    carousel: resolveCarouselSetting(record.carouselOptions ?? record.carousel_options),
    sectionId: sanitizeSectionId(readCdaStringForLogic(record, "sectionId", "section_id") || undefined),
    allCategoriesLabel: cmsAllLabel || fallbackAllLabel,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

export function readLatestPostCards(record: Record<string, unknown>, camel: string, snake: string): PostCardRecord[] {
  const raw = readCdaArray<Record<string, unknown>>(record, camel, snake);
  const posts: PostCardRecord[] = [];
  for (const item of raw) {
    if (!isRecord(item)) continue;
    const typename = typeof item.__typename === "string" ? item.__typename : "";
    if (typename && typename !== "PostRecord") continue;
    const id = typeof item.id === "string" ? item.id.trim() : "";
    const postTitle = readCdaString(item, "postTitle", "post_title");
    const postSlug = readCdaString(item, "postSlug", "post_slug");
    if (!id || !postTitle || !postSlug) continue;
    const published =
      typeof item._firstPublishedAt === "string"
        ? item._firstPublishedAt
        : typeof item.firstPublishedAt === "string"
          ? item.firstPublishedAt
          : "";
    const updated = typeof item._updatedAt === "string" ? item._updatedAt : published;
    const author = isRecord(item.postAuthor)
      ? item.postAuthor
      : isRecord(item.post_author)
        ? item.post_author
        : null;
    const authorName = author ? readCdaString(author, "authorName", "author_name") : "";
    posts.push({
      id,
      _firstPublishedAt: published,
      _updatedAt: updated,
      postTitle,
      postSlug,
      excerpt: readCdaString(item, "excerpt", "excerpt") || null,
      postAuthor: authorName ? { authorName } : null,
      postCategory: readCategorySummaries(item),
      coverImage: (item.coverImage ?? item.cover_image ?? null) as PostCardRecord["coverImage"],
    });
  }
  return posts;
}

export function readCategorySummariesFromRecord(
  record: Record<string, unknown>,
  camel: string,
  snake: string,
): PostCategorySummary[] {
  return readCdaArray<Record<string, unknown>>(record, camel, snake).flatMap((item) => {
    const summary = toCategorySummary(item);
    return summary ? [summary] : [];
  });
}

function readCategorySummaries(post: Record<string, unknown>): PostCategorySummary[] {
  const raw = readCdaArray<Record<string, unknown>>(post, "postCategory", "post_category");
  return raw.flatMap((item) => {
    const summary = toCategorySummary(item);
    return summary ? [summary] : [];
  });
}

function toCategorySummary(item: unknown): PostCategorySummary | null {
  if (!isRecord(item)) return null;
  const id = typeof item.id === "string" ? item.id.trim() : "";
  const categoryName = readCdaString(item, "categoryName", "category_name");
  if (!id || !categoryName) return null;
  const color = isRecord(item.categoryColor)
    ? item.categoryColor
    : isRecord(item.category_color)
      ? item.category_color
      : null;
  const hex = color && typeof color.hex === "string" ? color.hex : null;
  return {
    id,
    categoryName,
    categorySlug: readCdaString(item, "categorySlug", "category_slug") || null,
    categoryColor: hex ? { hex } : null,
  };
}

function timeValue(iso: string | undefined): number {
  if (!iso) return 0;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
}

/** Drop category chips that would yield an empty grid. */
export function categoriesWithPosts(
  categories: PostCategorySummary[],
  posts: PostCardRecord[],
): PostCategorySummary[] {
  const used = new Set(posts.flatMap((post) => post.postCategory.map((category) => category.id)));
  return categories.filter((category) => used.has(category.id));
}

/** Restrict the dataset to posts that belong to any of the given categories. */
export function postsInCategories(posts: PostCardRecord[], categoryIds: string[]): PostCardRecord[] {
  if (categoryIds.length === 0) return [];
  const allowed = new Set(categoryIds);
  return posts.filter((post) => post.postCategory.some((category) => allowed.has(category.id)));
}

/** Filter by category id (null = all), sort, then apply limit (`null` = sem teto). */
export function filterSortLimitPosts(
  posts: PostCardRecord[],
  categoryId: string | null,
  sort: LatestPostsSort,
  limit: number | null,
): PostCardRecord[] {
  const filtered = categoryId
    ? posts.filter((post) => post.postCategory.some((category) => category.id === categoryId))
    : posts;

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "oldest") {
      return timeValue(a._firstPublishedAt) - timeValue(b._firstPublishedAt);
    }
    if (sort === "popular") {
      return timeValue(b._updatedAt ?? b._firstPublishedAt) - timeValue(a._updatedAt ?? a._firstPublishedAt);
    }
    return timeValue(b._firstPublishedAt) - timeValue(a._firstPublishedAt);
  });

  if (limit == null) {
    return sorted;
  }

  return sorted.slice(0, Math.max(MIN_LIMIT, Math.min(MAX_LIMIT, limit)));
}
