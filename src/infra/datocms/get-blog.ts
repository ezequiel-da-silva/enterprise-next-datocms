import { datocmsFetch, type DatocmsResponse } from "@/infra/datocms/client";
import type { DatoSiteLocale } from "@/constants/i18n";
import {
  GET_ALL_POSTS,
  GET_AUTHOR_BY_SLUG,
  GET_CATEGORY_BY_SLUG,
  GET_POSTS_BY_AUTHOR,
  GET_POSTS_BY_CATEGORY,
  GET_POST_BY_SLUG,
} from "@/infra/datocms/queries";
import type {
  GetAllPostsQueryResult,
  GetAuthorBySlugQueryResult,
  GetCategoryBySlugQueryResult,
  GetPostBySlugQueryResult,
  GetPostsByAuthorQueryResult,
  GetPostsByCategoryQueryResult,
} from "@/infra/datocms/types-blog";
import {
  normalizeAuthorBySlugResult,
  normalizeCategoryBySlugResult,
  normalizePostBySlugResult,
} from "@/infra/datocms/types-blog";
import { cache } from "react";

function baseEditingOptions(includeDrafts: boolean) {
  const baseEditingUrl = process.env.NEXT_PUBLIC_DATOCMS_BASE_EDITING_URL;
  return {
    contentLink: includeDrafts && baseEditingUrl ? ("v1" as const) : undefined,
    baseEditingUrl: includeDrafts && baseEditingUrl ? baseEditingUrl : undefined,
  };
}

function devPublishedNoStore(includeDrafts: boolean) {
  return process.env.NODE_ENV === "development" && !includeDrafts;
}

const loadAllPosts = cache(
  async (
    locale: DatoSiteLocale,
    includeDrafts: boolean,
  ): Promise<DatocmsResponse<GetAllPostsQueryResult>> => {
    const noStore = includeDrafts || devPublishedNoStore(includeDrafts);
    const editing = baseEditingOptions(includeDrafts);
    return datocmsFetch<GetAllPostsQueryResult>({
      query: GET_ALL_POSTS,
      variables: { locale },
      tags: noStore ? undefined : ["datocms:blog", "datocms:posts"],
      revalidate: noStore ? false : 120,
      includeDrafts,
      ...editing,
      cache: noStore ? "no-store" : undefined,
    });
  },
);

const loadPostBySlug = cache(
  async (
    locale: DatoSiteLocale,
    slug: string,
    includeDrafts: boolean,
  ): Promise<DatocmsResponse<GetPostBySlugQueryResult>> => {
    const noStore = includeDrafts || devPublishedNoStore(includeDrafts);
    const editing = baseEditingOptions(includeDrafts);
    const response = await datocmsFetch<{
      post: Record<string, unknown> | null;
      _site: GetPostBySlugQueryResult["_site"];
    }>({
      query: GET_POST_BY_SLUG,
      variables: { locale, slug, withEditingUrl: Boolean(editing.baseEditingUrl) },
      tags: noStore ? undefined : ["datocms:blog", "datocms:posts", `post:${locale}:${slug}`],
      revalidate: noStore ? false : 120,
      includeDrafts,
      ...editing,
      cache: noStore ? "no-store" : undefined,
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
    const noStore = includeDrafts || devPublishedNoStore(includeDrafts);
    const editing = baseEditingOptions(includeDrafts);
    const response = await datocmsFetch<{
      author: Record<string, unknown> | null;
      _site: GetAuthorBySlugQueryResult["_site"];
    }>({
      query: GET_AUTHOR_BY_SLUG,
      variables: { locale, slug },
      tags: noStore ? undefined : ["datocms:blog", "datocms:authors", `author:${locale}:${slug}`],
      revalidate: noStore ? false : 300,
      includeDrafts,
      ...editing,
      cache: noStore ? "no-store" : undefined,
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
    const noStore = includeDrafts || devPublishedNoStore(includeDrafts);
    const editing = baseEditingOptions(includeDrafts);
    return datocmsFetch<GetPostsByAuthorQueryResult>({
      query: GET_POSTS_BY_AUTHOR,
      variables: { locale, authorId },
      tags: noStore ? undefined : ["datocms:blog", "datocms:posts", `author-posts:${authorId}`],
      revalidate: noStore ? false : 120,
      includeDrafts,
      ...editing,
      cache: noStore ? "no-store" : undefined,
    });
  },
);

const loadCategoryBySlug = cache(
  async (
    locale: DatoSiteLocale,
    slug: string,
    includeDrafts: boolean,
  ): Promise<DatocmsResponse<GetCategoryBySlugQueryResult>> => {
    const noStore = includeDrafts || devPublishedNoStore(includeDrafts);
    const editing = baseEditingOptions(includeDrafts);
    const response = await datocmsFetch<{
      category: Record<string, unknown> | null;
      _site: GetCategoryBySlugQueryResult["_site"];
    }>({
      query: GET_CATEGORY_BY_SLUG,
      variables: { locale, slug },
      tags: noStore ? undefined : ["datocms:blog", "datocms:categories", `category:${locale}:${slug}`],
      revalidate: noStore ? false : 300,
      includeDrafts,
      ...editing,
      cache: noStore ? "no-store" : undefined,
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
    const noStore = includeDrafts || devPublishedNoStore(includeDrafts);
    const editing = baseEditingOptions(includeDrafts);
    return datocmsFetch<GetPostsByCategoryQueryResult>({
      query: GET_POSTS_BY_CATEGORY,
      variables: { locale, categoryId },
      tags: noStore ? undefined : ["datocms:blog", "datocms:posts", `category-posts:${categoryId}`],
      revalidate: noStore ? false : 120,
      includeDrafts,
      ...editing,
      cache: noStore ? "no-store" : undefined,
    });
  },
);

export function getAllPosts(locale: DatoSiteLocale, includeDrafts: boolean) {
  return loadAllPosts(locale, includeDrafts);
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
