import { cdaFetchCache } from "@/infra/datocms/cda-fetch-cache";
import { datocmsFetch, type DatocmsResponse } from "@/infra/datocms/client";
import type { DatoSiteLocale } from "@/constants/i18n";
import {
  GET_ALL_CATEGORIES,
  GET_ALL_POSTS,
  GET_AUTHOR_BY_SLUG,
  GET_CATEGORY_BY_SLUG,
  GET_POSTS_BY_AUTHOR,
  GET_POSTS_BY_CATEGORY,
  GET_POST_BY_SLUG,
} from "@/infra/datocms/queries";
import type {
  GetAllCategoriesQueryResult,
  GetAllPostsQueryResult,
  GetAuthorBySlugQueryResult,
  GetCategoryBySlugQueryResult,
  GetPostBySlugQueryResult,
  GetPostsByAuthorQueryResult,
  GetPostsByCategoryQueryResult,
  LatestPostsCatalog,
} from "@/infra/datocms/types-blog";
import {
  normalizeAuthorBySlugResult,
  normalizeCategoryBySlugResult,
  normalizePostBySlugResult,
} from "@/infra/datocms/types-blog";
import { cache } from "react";
import { readContentListingSource } from "@/lib/datocms/resolve-content-listing-section";

function baseEditingOptions(includeDrafts: boolean) {
  const baseEditingUrl = process.env.NEXT_PUBLIC_DATOCMS_BASE_EDITING_URL;
  return {
    contentLink: includeDrafts && baseEditingUrl ? ("v1" as const) : undefined,
    baseEditingUrl: includeDrafts && baseEditingUrl ? baseEditingUrl : undefined,
  };
}

const loadAllPosts = cache(
  async (
    locale: DatoSiteLocale,
    includeDrafts: boolean,
  ): Promise<DatocmsResponse<GetAllPostsQueryResult>> => {
    const editing = baseEditingOptions(includeDrafts);
    return datocmsFetch<GetAllPostsQueryResult>({
      query: GET_ALL_POSTS,
      variables: { locale },
      includeDrafts,
      ...editing,
      ...cdaFetchCache({
        includeDrafts,
        tags: ["datocms:blog", "datocms:posts"],
        revalidate: 120,
      }),
    });
  },
);

const loadPostBySlug = cache(
  async (
    locale: DatoSiteLocale,
    slug: string,
    includeDrafts: boolean,
  ): Promise<DatocmsResponse<GetPostBySlugQueryResult>> => {
    const editing = baseEditingOptions(includeDrafts);
    const response = await datocmsFetch<{
      post: Record<string, unknown> | null;
      _site: GetPostBySlugQueryResult["_site"];
    }>({
      query: GET_POST_BY_SLUG,
      variables: { locale, slug, withEditingUrl: Boolean(editing.baseEditingUrl) },
      includeDrafts,
      ...editing,
      ...cdaFetchCache({
        includeDrafts,
        tags: ["datocms:blog", "datocms:posts", `post:${locale}:${slug}`],
        revalidate: 120,
        bypassPublishedCacheInDev: true,
      }),
    });
    if ("errors" in response) return response;
    return { data: normalizePostBySlugResult(response.data) };
  },
);

const loadAuthorBySlug = cache(
  async (
    locale: DatoSiteLocale,
    slug: string,
    includeDrafts: boolean,
  ): Promise<DatocmsResponse<GetAuthorBySlugQueryResult>> => {
    const editing = baseEditingOptions(includeDrafts);
    const response = await datocmsFetch<{
      author: Record<string, unknown> | null;
      _site: GetAuthorBySlugQueryResult["_site"];
    }>({
      query: GET_AUTHOR_BY_SLUG,
      variables: { locale, slug },
      includeDrafts,
      ...editing,
      ...cdaFetchCache({
        includeDrafts,
        tags: ["datocms:blog", "datocms:authors", `author:${locale}:${slug}`],
        revalidate: 300,
        bypassPublishedCacheInDev: true,
      }),
    });
    if ("errors" in response) return response;
    return { data: normalizeAuthorBySlugResult(response.data) };
  },
);

const loadPostsByAuthor = cache(
  async (
    locale: DatoSiteLocale,
    authorId: string,
    includeDrafts: boolean,
  ): Promise<DatocmsResponse<GetPostsByAuthorQueryResult>> => {
    const editing = baseEditingOptions(includeDrafts);
    return datocmsFetch<GetPostsByAuthorQueryResult>({
      query: GET_POSTS_BY_AUTHOR,
      variables: { locale, authorId },
      includeDrafts,
      ...editing,
      ...cdaFetchCache({
        includeDrafts,
        tags: ["datocms:blog", "datocms:posts", `author-posts:${authorId}`],
        revalidate: 120,
      }),
    });
  },
);

const loadCategoryBySlug = cache(
  async (
    locale: DatoSiteLocale,
    slug: string,
    includeDrafts: boolean,
  ): Promise<DatocmsResponse<GetCategoryBySlugQueryResult>> => {
    const editing = baseEditingOptions(includeDrafts);
    const response = await datocmsFetch<{
      category: Record<string, unknown> | null;
      _site: GetCategoryBySlugQueryResult["_site"];
    }>({
      query: GET_CATEGORY_BY_SLUG,
      variables: { locale, slug },
      includeDrafts,
      ...editing,
      ...cdaFetchCache({
        includeDrafts,
        tags: ["datocms:blog", "datocms:categories", `category:${locale}:${slug}`],
        revalidate: 300,
        bypassPublishedCacheInDev: true,
      }),
    });
    if ("errors" in response) return response;
    return { data: normalizeCategoryBySlugResult(response.data) };
  },
);

const loadPostsByCategory = cache(
  async (
    locale: DatoSiteLocale,
    categoryId: string,
    includeDrafts: boolean,
  ): Promise<DatocmsResponse<GetPostsByCategoryQueryResult>> => {
    const editing = baseEditingOptions(includeDrafts);
    return datocmsFetch<GetPostsByCategoryQueryResult>({
      query: GET_POSTS_BY_CATEGORY,
      variables: { locale, categoryId },
      includeDrafts,
      ...editing,
      ...cdaFetchCache({
        includeDrafts,
        tags: ["datocms:blog", "datocms:posts", `category-posts:${categoryId}`],
        revalidate: 120,
      }),
    });
  },
);

const loadAllCategories = cache(
  async (
    locale: DatoSiteLocale,
    includeDrafts: boolean,
  ): Promise<DatocmsResponse<GetAllCategoriesQueryResult>> => {
    const editing = baseEditingOptions(includeDrafts);
    return datocmsFetch<GetAllCategoriesQueryResult>({
      query: GET_ALL_CATEGORIES,
      variables: { locale },
      includeDrafts,
      ...editing,
      ...cdaFetchCache({
        includeDrafts,
        tags: ["datocms:blog", "datocms:categories"],
        revalidate: 300,
      }),
    });
  },
);

export function getAllPosts(locale: DatoSiteLocale, includeDrafts: boolean) {
  return loadAllPosts(locale, includeDrafts);
}

export function getAllCategories(locale: DatoSiteLocale, includeDrafts: boolean) {
  return loadAllCategories(locale, includeDrafts);
}

export async function loadLatestPostsCatalog(
  locale: DatoSiteLocale,
  includeDrafts: boolean,
): Promise<LatestPostsCatalog> {
  const [postsResult, categoriesResult] = await Promise.all([
    loadAllPosts(locale, includeDrafts),
    loadAllCategories(locale, includeDrafts),
  ]);
  return {
    posts: "errors" in postsResult ? [] : postsResult.data.allPosts,
    categories: "errors" in categoriesResult ? [] : categoriesResult.data.allCategories,
  };
}

export function contentNeedsLatestPostsCatalog(
  blocks: ({ __typename?: string } & Record<string, unknown>)[],
): boolean {
  return blocks.some(
    (block) =>
      block.__typename === "ContentListingSectionRecord" &&
      readContentListingSource(block) === "blog",
  );
}

export function getPostBySlug(locale: DatoSiteLocale, slug: string, includeDrafts: boolean) {
  return loadPostBySlug(locale, slug, includeDrafts);
}

export function getAuthorBySlug(locale: DatoSiteLocale, slug: string, includeDrafts: boolean) {
  return loadAuthorBySlug(locale, slug, includeDrafts);
}

export function getPostsByAuthor(locale: DatoSiteLocale, authorId: string, includeDrafts: boolean) {
  return loadPostsByAuthor(locale, authorId, includeDrafts);
}

export function getCategoryBySlug(locale: DatoSiteLocale, slug: string, includeDrafts: boolean) {
  return loadCategoryBySlug(locale, slug, includeDrafts);
}

export function getPostsByCategory(locale: DatoSiteLocale, categoryId: string, includeDrafts: boolean) {
  return loadPostsByCategory(locale, categoryId, includeDrafts);
}
