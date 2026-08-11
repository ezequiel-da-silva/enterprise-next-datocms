import type { CdaStructuredTextValue } from "datocms-structured-text-utils";
import type { TitleMetaLinkTag } from "react-datocms/seo";
import type { FileFieldLike, PageStructuredTextBlock, SeoSettingsSocial } from "@/infra/datocms/types-page";

export type ImageBlockResponsive = {
  id: string;
  asset?: FileFieldLike;
  assetDesktop?: FileFieldLike;
};

export type PostCategorySummary = {
  id: string;
  categoryName: string;
  categorySlug: string | null;
  categoryColor: { hex: string } | null;
};

export type PostAuthorName = {
  authorName: string;
};

export type PostCardRecord = {
  id: string;
  _firstPublishedAt: string;
  postTitle: string;
  postSlug: string;
  postAuthor: PostAuthorName | null;
  postCategory: PostCategorySummary[];
  coverImage: ImageBlockResponsive | null;
};

export type SocialLinkRecord = {
  id: string;
  plataforma: string | null;
  url: string | null;
};

export type AuthorBioField = Pick<CdaStructuredTextValue, "value" | "blocks" | "links" | "inlineBlocks">;

export type SlugLocaleRow = { locale?: string | null; value?: string | null };

export type AuthorDetailRecord = {
  id: string;
  authorName: string;
  authorSlug: string;
  authorBio: AuthorBioField | null;
  avatarBio: ImageBlockResponsive | null;
  authorSocialLinks: SocialLinkRecord | null;
  seoSettingsSocial: SeoSettingsSocial;
  _seoMetaTags: TitleMetaLinkTag[] | null;
  /** Presente no fetch de autor; omitido no nested `postAuthor`. */
  slugLocales?: SlugLocaleRow[];
};

export type PostDetailRecord = {
  id: string;
  _firstPublishedAt: string;
  _updatedAt: string;
  postTitle: string;
  postSlug: string;
  postCategory: PostCategorySummary[];
  postContent: (CdaStructuredTextValue & { blocks: PageStructuredTextBlock[] | null }) | null;
  coverImage: ImageBlockResponsive | null;
  postAuthor: AuthorDetailRecord | null;
  seoSettingsSocial: SeoSettingsSocial;
  _seoMetaTags: TitleMetaLinkTag[] | null;
  slugLocales: SlugLocaleRow[];
};

export type CategoryDetailRecord = {
  id: string;
  categoryName: string;
  categorySlug: string | null;
  categoryDescription: AuthorBioField | null;
  categoryColor: { hex: string } | null;
  categoryIcon: FileFieldLike;
  seoSettingsSocial: SeoSettingsSocial;
  _seoMetaTags: TitleMetaLinkTag[] | null;
  slugLocales: SlugLocaleRow[];
};

export type GetAllPostsQueryResult = {
  allPosts: PostCardRecord[];
  _site: { faviconMetaTags: TitleMetaLinkTag[] | null };
};

export type GetPostBySlugQueryResult = {
  post: PostDetailRecord | null;
  _site: { faviconMetaTags: TitleMetaLinkTag[] | null };
};

export type GetAuthorBySlugQueryResult = {
  author: AuthorDetailRecord | null;
  _site: { faviconMetaTags: TitleMetaLinkTag[] | null };
};

export type GetPostsByAuthorQueryResult = {
  allPosts: PostCardRecord[];
};

export type GetCategoryBySlugQueryResult = {
  category: CategoryDetailRecord | null;
  _site: { faviconMetaTags: TitleMetaLinkTag[] | null };
};

export type GetPostsByCategoryQueryResult = {
  allPosts: PostCardRecord[];
};

function readSlugLocales(record: Record<string, unknown>, key: string): SlugLocaleRow[] {
  const raw = record[key];
  return Array.isArray(raw) ? (raw as SlugLocaleRow[]) : [];
}

/** Normaliza `_allPostSlugLocales` do CDA para `slugLocales`. */
export function normalizePostBySlugResult(data: {
  post: Record<string, unknown> | null;
  _site: GetPostBySlugQueryResult["_site"];
}): GetPostBySlugQueryResult {
  const post = data.post;
  if (!post) return { post: null, _site: data._site };
  return {
    post: {
      ...(post as unknown as Omit<PostDetailRecord, "slugLocales">),
      slugLocales: readSlugLocales(post, "_allPostSlugLocales"),
    },
    _site: data._site,
  };
}

export function normalizeAuthorBySlugResult(data: {
  author: Record<string, unknown> | null;
  _site: GetAuthorBySlugQueryResult["_site"];
}): GetAuthorBySlugQueryResult {
  const author = data.author;
  if (!author) return { author: null, _site: data._site };
  return {
    author: {
      ...(author as unknown as Omit<AuthorDetailRecord, "slugLocales">),
      slugLocales: readSlugLocales(author, "_allAuthorSlugLocales"),
    },
    _site: data._site,
  };
}

export function normalizeCategoryBySlugResult(data: {
  category: Record<string, unknown> | null;
  _site: GetCategoryBySlugQueryResult["_site"];
}): GetCategoryBySlugQueryResult {
  const category = data.category;
  if (!category) return { category: null, _site: data._site };
  return {
    category: {
      ...(category as unknown as Omit<CategoryDetailRecord, "slugLocales">),
      slugLocales: readSlugLocales(category, "_allCategorySlugLocales"),
    },
    _site: data._site,
  };
}
