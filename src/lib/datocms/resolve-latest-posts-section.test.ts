import { describe, expect, it } from "vitest";
import type { PostCardRecord, PostCategorySummary } from "@/infra/datocms/types-blog";
import {
  LATEST_POSTS_DEFAULTS,
  categoriesWithPosts,
  filterSortLimitPosts,
  postsInCategories,
  resolveLatestPostsOptions,
} from "./resolve-latest-posts-section";

describe("resolveLatestPostsOptions", () => {
  it("uses defaults when fields are missing", () => {
    expect(resolveLatestPostsOptions({}, "All")).toEqual({
      ...LATEST_POSTS_DEFAULTS,
      allCategoriesLabel: "All",
    });
  });

  it("reads camelCase and snake_case", () => {
    expect(
      resolveLatestPostsOptions(
        {
          fetchMode: "manual",
          categoryDisplay: "selected",
          showSortTabs: false,
          hasLimit: true,
          limit: 9,
          sectionId: "Blog Destaques!",
          allCategoriesLabel: "Everything",
        },
        "All",
      ),
    ).toEqual({
      fetchMode: "manual",
      categoryDisplay: "selected",
      showSortTabs: false,
      hasLimit: true,
      limit: 9,
      sectionId: "blog-destaques",
      allCategoriesLabel: "Everything",
    });

    expect(
      resolveLatestPostsOptions(
        {
          fetch_mode: "auto",
          category_display: "none",
          show_sort_tabs: true,
          has_limit: true,
          limit: 3,
        },
        "Todas",
      ),
    ).toMatchObject({
      fetchMode: "auto",
      categoryDisplay: "none",
      showSortTabs: true,
      hasLimit: true,
      limit: 3,
      allCategoriesLabel: "Todas",
    });
  });

  it("normalizes CMS labels and clamps limit", () => {
    expect(resolveLatestPostsOptions({ fetchMode: "Curadoria manual" }, "All").fetchMode).toBe("manual");
    expect(resolveLatestPostsOptions({ categoryDisplay: "Selecionadas" }, "All").categoryDisplay).toBe(
      "selected",
    );
    expect(resolveLatestPostsOptions({ category_display: "Ocultar" }, "All").categoryDisplay).toBe("none");
    expect(resolveLatestPostsOptions({ limit: 0 }, "All").limit).toBe(1);
    expect(resolveLatestPostsOptions({ limit: 500 }, "All").limit).toBe(100);
    expect(resolveLatestPostsOptions({ showSortTabs: false }, "All").showSortTabs).toBe(false);
    expect(resolveLatestPostsOptions({ hasLimit: true }, "All").hasLimit).toBe(true);
    expect(resolveLatestPostsOptions({ has_limit: false, limit: 3 }, "All").hasLimit).toBe(false);
  });
});

const sample = (id: string, published: string, updated: string, categoryId?: string): PostCardRecord => ({
  id,
  _firstPublishedAt: published,
  _updatedAt: updated,
  postTitle: id,
  postSlug: id,
  postAuthor: null,
  postCategory: categoryId
    ? [{ id: categoryId, categoryName: "Cat", categorySlug: "cat", categoryColor: null }]
    : [],
  coverImage: null,
});

describe("filterSortLimitPosts", () => {
  const posts = [
    sample("a", "2024-01-01T00:00:00.000Z", "2026-01-01T00:00:00.000Z", "news"),
    sample("b", "2025-01-01T00:00:00.000Z", "2025-06-01T00:00:00.000Z", "guides"),
    sample("c", "2023-01-01T00:00:00.000Z", "2023-01-02T00:00:00.000Z", "news"),
  ];

  it("sorts newest by first published date and applies limit", () => {
    expect(filterSortLimitPosts(posts, null, "newest", 2).map((p) => p.id)).toEqual(["b", "a"]);
  });

  it("sorts oldest and populares by updatedAt", () => {
    expect(filterSortLimitPosts(posts, null, "oldest", 3).map((p) => p.id)).toEqual(["c", "a", "b"]);
    expect(filterSortLimitPosts(posts, null, "popular", 3).map((p) => p.id)).toEqual(["a", "b", "c"]);
  });

  it("filters by category then sorts", () => {
    expect(filterSortLimitPosts(posts, "news", "newest", 10).map((p) => p.id)).toEqual(["a", "c"]);
  });

  it("skips the cap when limit is null", () => {
    expect(filterSortLimitPosts(posts, null, "newest", null).map((p) => p.id)).toEqual(["b", "a", "c"]);
  });

  it("restricts the dataset to selected categories", () => {
    expect(postsInCategories(posts, ["guides"]).map((p) => p.id)).toEqual(["b"]);
    expect(postsInCategories(posts, ["news", "guides"]).map((p) => p.id).sort()).toEqual(["a", "b", "c"]);
    expect(postsInCategories(posts, [])).toEqual([]);
  });

  it("omits categories that have no posts in the dataset", () => {
    const cats: PostCategorySummary[] = [
      { id: "news", categoryName: "News", categorySlug: "news", categoryColor: null },
      { id: "animal", categoryName: "Animal", categorySlug: "animal", categoryColor: null },
      { id: "guides", categoryName: "Guides", categorySlug: "guides", categoryColor: null },
    ];
    expect(categoriesWithPosts(cats, posts).map((c) => c.id)).toEqual(["news", "guides"]);
  });
});
