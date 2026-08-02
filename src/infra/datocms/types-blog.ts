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

export type AuthorDetailRecord = {
  id: string;
  authorName: string;
  authorSlug: string;
  authorBio: AuthorBioField | null;
  avatarBio: ImageBlockResponsive | null;
  authorSocialLinks: SocialLinkRecord | null;
  seoSettingsSocial: SeoSettingsSocial;
  _seoMetaTags: TitleMetaLinkTag[] | null;
};

export type PostDetailRecord = {
  id: string;
  _firstPublishedAt: string;
  postTitle: string;
  postSlug: string;
  postCategory: PostCategorySummary[];
  postContent: (CdaStructuredTextValue & { blocks: PageStructuredTextBlock[] | null }) | null;
  coverImage: ImageBlockResponsive | null;
  postAuthor: AuthorDetailRecord | null;
  seoSettingsSocial: SeoSettingsSocial;
  _seoMetaTags: TitleMetaLinkTag[] | null;
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
