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
  _updatedAt?: string;
  postTitle: string;
  postSlug: string;
  excerpt?: string | null;
  postAuthor: PostAuthorName | null;
  postCategory: PostCategorySummary[];
  coverImage: ImageBlockResponsive | null;
};

export type SocialLinkRecord = {
  id: string;
  plataforma: string | null;
  url: string | null;
  linkAria?: string | null;
  openInNewTab?: boolean | null;
  image?: FileFieldLike;
};

export type AuthorBioField = Pick<CdaStructuredTextValue, "value" | "blocks" | "links" | "inlineBlocks">;

export type SlugLocaleRow = { locale?: string | null; value?: string | null };

export type AuthorDetailRecord = {
  id: string;
  authorName: string;
  authorSlug: string;
  authorRole?: string | null;
  authorBio: AuthorBioField | null;
  avatarBio: ImageBlockResponsive | null;
  authorSocialLinks: SocialLinkRecord[];
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
  excerpt?: string | null;
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

export type GetAllCategoriesQueryResult = {
  allCategories: PostCategorySummary[];
};

export type LatestPostsCatalog = {
  posts: PostCardRecord[];
  categories: PostCategorySummary[];
};

function readSlugLocales(record: Record<string, unknown>, key: string): SlugLocaleRow[] {
  const raw = record[key];
  return Array.isArray(raw) ? (raw as SlugLocaleRow[]) : [];
}

function coerceSocialLinks(raw: unknown): SocialLinkRecord[] {
  if (Array.isArray(raw)) {
    return raw.filter(
      (item): item is SocialLinkRecord =>
        Boolean(item && typeof item === "object" && typeof (item as SocialLinkRecord).id === "string"),
    );
  }
  if (raw && typeof raw === "object" && typeof (raw as SocialLinkRecord).id === "string") {
    return [raw as SocialLinkRecord];
  }
  return [];
}

function coerceAuthorDetail(
  record: Record<string, unknown>,
  slugLocales: SlugLocaleRow[] | undefined,
): AuthorDetailRecord {
  const author = record as unknown as Omit<AuthorDetailRecord, "slugLocales" | "authorSocialLinks"> & {
    authorSocialLinks?: unknown;
  };
  return {
    ...author,
    authorSocialLinks: coerceSocialLinks(author.authorSocialLinks),
    ...(slugLocales ? { slugLocales } : {}),
  };
}

/** Normaliza `_allPostSlugLocales` do CDA para `slugLocales`. */
export function normalizePostBySlugResult(data: {
  post: Record<string, unknown> | null;
  _site: GetPostBySlugQueryResult["_site"];
}): GetPostBySlugQueryResult {
  const post = data.post;
  if (!post) return { post: null, _site: data._site };
  const postAuthorRaw = post.postAuthor;
  const postAuthor =
    postAuthorRaw && typeof postAuthorRaw === "object"
      ? coerceAuthorDetail(postAuthorRaw as Record<string, unknown>, undefined)
      : null;
  return {
    post: {
      ...(post as unknown as Omit<PostDetailRecord, "slugLocales" | "postAuthor">),
      postAuthor,
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
    author: coerceAuthorDetail(author, readSlugLocales(author, "_allAuthorSlugLocales")),
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
