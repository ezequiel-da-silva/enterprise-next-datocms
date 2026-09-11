/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type * as Types from './schema.types';

export type AllRedirectsQueryVariables = Exact<{ [key: string]: never; }>;


export type AllRedirectsQuery = { allRedirects: Array<{ id: string, fromPathRedirect: string | null, toPathRedirect: string | null, statusRedirect: string | null }> };

export type AuthorCardFragmentFragment = { id: string, authorName: string | null, authorSlug: string | null, authorRole: string | null, avatarBio: { __typename: 'ImageBlockRecord', id: string, asset: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null, assetDesktop: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null } | null, authorSocialLinks: Array<{ id: string, plataforma: string | null, url: string | null, openInNewTab: boolean, linkAria: string | null, image: { url: string, alt: string | null, width: number | null, height: number | null } | null }> };

export type BlogPostsSectionBlockFragmentFragment = { id: string, fetchMode: string | null, allCategoriesLabel: string | null, categoryDisplay: string | null, showSortTabs: boolean, hasLimit: boolean, limit: number | null, displayType: string | null, initialCount: number | null, loadMoreStep: number | null, loadMoreLabel: string | null, textHeaderSection: Array<{ __typename: 'TextHeaderRecord', id: string, title: string | null, hasDescription: boolean, description: string | null, hasSectionId: boolean, sectionId: string | null }>, carouselOptions: Array<{ __typename: 'CarouselSettingRecord', id: string, autoplay: boolean, autoplayInterval: number | null, showArrows: boolean, showDots: boolean, loop: boolean }>, selectedCategories: Array<{ id: string, categoryName: string | null, categorySlug: string | null, categoryColor: { hex: string } | null }>, manualPosts: Array<{ id: string, _firstPublishedAt: string, _updatedAt: string, postTitle: string | null, postSlug: string | null, excerpt: string | null, postAuthor: { authorName: string | null } | null, postCategory: Array<{ id: string, categoryName: string | null, categorySlug: string | null, categoryColor: { hex: string } | null }>, coverImage: { __typename: 'CardImageBlockRecord', id: string, assetMobile: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null, assetDesktop: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null } | null }> };

export type CarouselSettingBlockFragmentFragment = { __typename: 'CarouselSettingRecord', id: string, autoplay: boolean, autoplayInterval: number | null, showArrows: boolean, showDots: boolean, loop: boolean };

export type CtaBannerBlockFieldsFragment = { id: string, hasEyebrow: boolean, eyebrow: string | null, advancedOptions: boolean, variant: string | null, bgTheme: string | null, hasImage: boolean, textHeaderSection: Array<{ __typename: 'TextHeaderRecord', id: string, title: string | null, hasDescription: boolean, description: string | null, hasSectionId: boolean, sectionId: string | null }>, buttons: Array<{ __typename: 'LinkRecord', id: string, ctaLabel: string | null, typeContent: string | null, externalLink: string | null, openInNewTab: boolean, ctaLinkAria: string | null, internalLinkPage: { __typename: 'PageRecord', slug: string | null } | null, internalLinkPost: { __typename: 'PostRecord', postSlug: string | null } | null, internalLinkCategory: { __typename: 'CategoryRecord', categorySlug: string | null } | null, internalLinkAuthor: { __typename: 'AuthorRecord', authorSlug: string | null } | null }>, imageBanner: Array<{ __typename: 'BannerImageBlockRecord', id: string, assetMobile: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null, assetDesktop: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null }> };

export type FeatureGridBlockFragmentFragment = { id: string, advancedOptions: boolean, variant: string | null, textHeaderSection: Array<{ __typename: 'TextHeaderRecord', id: string, title: string | null, hasDescription: boolean, description: string | null, hasSectionId: boolean, sectionId: string | null }>, carouselOptions: Array<{ __typename: 'CarouselSettingRecord', id: string, autoplay: boolean, autoplayInterval: number | null, showArrows: boolean, showDots: boolean, loop: boolean }>, itemsFeatureGrid: Array<{ __typename: 'CardRecord', id: string, titleCard: string | null, hasIcon: boolean, iconCard: unknown, hasDescription: boolean, descriptionCard: string | null, hasImage: boolean, hasLink: boolean, imageCard: { __typename: 'CardImageBlockRecord', id: string, assetMobile: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null, assetDesktop: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null } | null, linkCard: { __typename: 'LinkRecord', id: string, ctaLabel: string | null, typeContent: string | null, externalLink: string | null, openInNewTab: boolean, ctaLinkAria: string | null, internalLinkPage: { __typename: 'PageRecord', slug: string | null } | null, internalLinkPost: { __typename: 'PostRecord', postSlug: string | null } | null, internalLinkCategory: { __typename: 'CategoryRecord', categorySlug: string | null } | null, internalLinkAuthor: { __typename: 'AuthorRecord', authorSlug: string | null } | null } | null }> };

export type LogoGridBlockFragmentFragment = { id: string, grayscale: boolean, layoutStyle: string | null, textHeaderSection: Array<{ __typename: 'TextHeaderRecord', id: string, title: string | null, hasDescription: boolean, description: string | null, hasSectionId: boolean, sectionId: string | null }>, logos: Array<{ __typename: 'ImageBlockRecord', id: string, asset: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null, assetDesktop: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null }> };

export type PostCardFieldsFragment = { id: string, _firstPublishedAt: string, _updatedAt: string, postTitle: string | null, postSlug: string | null, excerpt: string | null, postAuthor: { authorName: string | null } | null, postCategory: Array<{ id: string, categoryName: string | null, categorySlug: string | null, categoryColor: { hex: string } | null }>, coverImage: { __typename: 'CardImageBlockRecord', id: string, assetMobile: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null, assetDesktop: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null } | null };

export type PricingSectionBlockFragmentFragment = { id: string, textHeaderSection: Array<{ __typename: 'TextHeaderRecord', id: string, title: string | null, hasDescription: boolean, description: string | null, hasSectionId: boolean, sectionId: string | null }>, plans: Array<{ __typename: 'PricingCardRecord', id: string, name: string | null, hasDescription: boolean, description: string | null, priceType: string | null, currency: string | null, amount: number | null, billingPeriod: string | null, isPopular: boolean, features: string | null, hasButton: boolean, ctaButton: Array<{ __typename: 'LinkRecord', id: string, ctaLabel: string | null, typeContent: string | null, externalLink: string | null, openInNewTab: boolean, ctaLinkAria: string | null, internalLinkPage: { __typename: 'PageRecord', slug: string | null } | null, internalLinkPost: { __typename: 'PostRecord', postSlug: string | null } | null, internalLinkCategory: { __typename: 'CategoryRecord', categorySlug: string | null } | null, internalLinkAuthor: { __typename: 'AuthorRecord', authorSlug: string | null } | null }> }> };

export type ReviewsSectionBlockFragmentFragment = { id: string, allowSubmissions: boolean, textHeaderSection: Array<{ __typename: 'TextHeaderRecord', id: string, title: string | null, hasDescription: boolean, description: string | null, hasSectionId: boolean, sectionId: string | null }>, reviews: Array<{ id: string, authorName: string | null, rating: number | null, comment: string | null, authorAvatar: { url: string, alt: string | null, width: number | null, height: number | null } | null }> };

export type FileAssetFieldsFragment = { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null };

export type HeroImageBlockFieldsFragment = { __typename: 'HeroImageBlockRecord', id: string, assetMobile: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null, assetDesktop: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null };

export type CardImageBlockFieldsFragment = { __typename: 'CardImageBlockRecord', id: string, assetMobile: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null, assetDesktop: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null };

export type BannerImageBlockFieldsFragment = { __typename: 'BannerImageBlockRecord', id: string, assetMobile: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null, assetDesktop: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null };

export type StatsSectionBlockFragmentFragment = { id: string, textHeaderSection: Array<{ __typename: 'TextHeaderRecord', id: string, title: string | null, hasDescription: boolean, description: string | null, hasSectionId: boolean, sectionId: string | null }>, stats: Array<{ __typename: 'StatCardRecord', id: string, value: string | null, label: string | null, hasDescription: boolean, description: string | null }> };

export type StepsSectionBlockFragmentFragment = { id: string, textHeaderSection: Array<{ __typename: 'TextHeaderRecord', id: string, title: string | null, hasDescription: boolean, description: string | null, hasSectionId: boolean, sectionId: string | null }>, steps: Array<{ __typename: 'StepCardRecord', id: string, title: string | null, hasDescription: boolean, description: string | null, hasImage: boolean, mediaImage: Array<{ __typename: 'CardImageBlockRecord', id: string, assetMobile: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null, assetDesktop: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null }> }> };

export type TabsSectionBlockFragmentFragment = { id: string, textHeaderSection: Array<{ __typename: 'TextHeaderRecord', id: string, title: string | null, hasDescription: boolean, description: string | null, hasSectionId: boolean, sectionId: string | null }>, tabs: Array<{ __typename: 'TabItemRecord', id: string, labelTab: string | null, title: string | null, hasDescription: boolean, description: string | null, hasLink: boolean, hasImage: boolean, ctaLink: { __typename: 'LinkRecord', id: string, ctaLabel: string | null, typeContent: string | null, externalLink: string | null, openInNewTab: boolean, ctaLinkAria: string | null, internalLinkPage: { __typename: 'PageRecord', slug: string | null } | null, internalLinkPost: { __typename: 'PostRecord', postSlug: string | null } | null, internalLinkCategory: { __typename: 'CategoryRecord', categorySlug: string | null } | null, internalLinkAuthor: { __typename: 'AuthorRecord', authorSlug: string | null } | null } | null, mediaImage: { __typename: 'CardImageBlockRecord', id: string, assetMobile: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null, assetDesktop: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null } | null }> };

export type TeamSectionBlockFragmentFragment = { id: string, textHeaderSection: Array<{ __typename: 'TextHeaderRecord', id: string, title: string | null, hasDescription: boolean, description: string | null, hasSectionId: boolean, sectionId: string | null }>, members: Array<{ id: string, authorName: string | null, authorSlug: string | null, authorRole: string | null, avatarBio: { __typename: 'ImageBlockRecord', id: string, asset: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null, assetDesktop: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null } | null, authorSocialLinks: Array<{ id: string, plataforma: string | null, url: string | null, openInNewTab: boolean, linkAria: string | null, image: { url: string, alt: string | null, width: number | null, height: number | null } | null }> }> };

export type TextHeaderBlockFragmentFragment = { __typename: 'TextHeaderRecord', id: string, title: string | null, hasDescription: boolean, description: string | null, hasSectionId: boolean, sectionId: string | null };

type TextSectionMediaBlocks_AuthorRecord_Fragment = { __typename: 'AuthorRecord', id: string };

type TextSectionMediaBlocks_BannerImageBlockRecord_Fragment = { __typename: 'BannerImageBlockRecord', id: string };

type TextSectionMediaBlocks_BlogPostsSectionRecord_Fragment = { __typename: 'BlogPostsSectionRecord', id: string };

type TextSectionMediaBlocks_CardImageBlockRecord_Fragment = { __typename: 'CardImageBlockRecord', id: string };

type TextSectionMediaBlocks_CardRecord_Fragment = { __typename: 'CardRecord', id: string };

type TextSectionMediaBlocks_CarouselSettingRecord_Fragment = { __typename: 'CarouselSettingRecord', id: string };

type TextSectionMediaBlocks_CategoryRecord_Fragment = { __typename: 'CategoryRecord', id: string };

type TextSectionMediaBlocks_ColorThemeRecord_Fragment = { __typename: 'ColorThemeRecord', id: string };

type TextSectionMediaBlocks_CtaBannerRecord_Fragment = { __typename: 'CtaBannerRecord', id: string };

type TextSectionMediaBlocks_FaqGroupRecord_Fragment = { __typename: 'FaqGroupRecord', id: string };

type TextSectionMediaBlocks_FaqItemRecord_Fragment = { __typename: 'FaqItemRecord', id: string };

type TextSectionMediaBlocks_FeatureGridRecord_Fragment = { __typename: 'FeatureGridRecord', id: string };

type TextSectionMediaBlocks_GlobalSettingRecord_Fragment = { __typename: 'GlobalSettingRecord', id: string };

type TextSectionMediaBlocks_HeroImageBlockRecord_Fragment = { __typename: 'HeroImageBlockRecord', id: string };

type TextSectionMediaBlocks_HeroSectionRecord_Fragment = { __typename: 'HeroSectionRecord', id: string };

type TextSectionMediaBlocks_ImageBlockRecord_Fragment = { __typename: 'ImageBlockRecord', id: string, asset: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null, assetDesktop: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null };

type TextSectionMediaBlocks_ImageGalleryBlockRecord_Fragment = { __typename: 'ImageGalleryBlockRecord', id: string, assets: Array<{ url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null }> };

type TextSectionMediaBlocks_LinkRecord_Fragment = { __typename: 'LinkRecord', id: string };

type TextSectionMediaBlocks_LogoGridRecord_Fragment = { __typename: 'LogoGridRecord', id: string };

type TextSectionMediaBlocks_NavItemModularRecord_Fragment = { __typename: 'NavItemModularRecord', id: string };

type TextSectionMediaBlocks_NavItemSimpleRecord_Fragment = { __typename: 'NavItemSimpleRecord', id: string };

type TextSectionMediaBlocks_NavigationRecord_Fragment = { __typename: 'NavigationRecord', id: string };

type TextSectionMediaBlocks_PageRecord_Fragment = { __typename: 'PageRecord', id: string };

type TextSectionMediaBlocks_PostRecord_Fragment = { __typename: 'PostRecord', id: string };

type TextSectionMediaBlocks_PricingCardRecord_Fragment = { __typename: 'PricingCardRecord', id: string };

type TextSectionMediaBlocks_PricingSectionRecord_Fragment = { __typename: 'PricingSectionRecord', id: string };

type TextSectionMediaBlocks_RedirectRecord_Fragment = { __typename: 'RedirectRecord', id: string };

type TextSectionMediaBlocks_ReviewsSectionRecord_Fragment = { __typename: 'ReviewsSectionRecord', id: string };

type TextSectionMediaBlocks_SchemaMigrationRecord_Fragment = { __typename: 'SchemaMigrationRecord', id: string };

type TextSectionMediaBlocks_SocialLinkRecord_Fragment = { __typename: 'SocialLinkRecord', id: string };

type TextSectionMediaBlocks_StatCardRecord_Fragment = { __typename: 'StatCardRecord', id: string };

type TextSectionMediaBlocks_StatsSectionRecord_Fragment = { __typename: 'StatsSectionRecord', id: string };

type TextSectionMediaBlocks_StepCardRecord_Fragment = { __typename: 'StepCardRecord', id: string };

type TextSectionMediaBlocks_StepsSectionRecord_Fragment = { __typename: 'StepsSectionRecord', id: string };

type TextSectionMediaBlocks_TabItemRecord_Fragment = { __typename: 'TabItemRecord', id: string };

type TextSectionMediaBlocks_TabsSectionRecord_Fragment = { __typename: 'TabsSectionRecord', id: string };

type TextSectionMediaBlocks_TeamSectionRecord_Fragment = { __typename: 'TeamSectionRecord', id: string };

type TextSectionMediaBlocks_TextHeaderRecord_Fragment = { __typename: 'TextHeaderRecord', id: string };

type TextSectionMediaBlocks_TextSectionRecord_Fragment = { __typename: 'TextSectionRecord', id: string };

type TextSectionMediaBlocks_UserReviewRecord_Fragment = { __typename: 'UserReviewRecord', id: string };

type TextSectionMediaBlocks_VideoBlockRecord_Fragment = { __typename: 'VideoBlockRecord', id: string, _editingUrl?: string | null, asset: { url: string, title: string | null, width: number | null, height: number | null, video: { muxPlaybackId: string, streamingUrl: string, mp4Url: string | null, thumbnailUrl: string, width: number, height: number, duration: number | null } | null } | null };

export type TextSectionMediaBlocksFragment =
  | TextSectionMediaBlocks_AuthorRecord_Fragment
  | TextSectionMediaBlocks_BannerImageBlockRecord_Fragment
  | TextSectionMediaBlocks_BlogPostsSectionRecord_Fragment
  | TextSectionMediaBlocks_CardImageBlockRecord_Fragment
  | TextSectionMediaBlocks_CardRecord_Fragment
  | TextSectionMediaBlocks_CarouselSettingRecord_Fragment
  | TextSectionMediaBlocks_CategoryRecord_Fragment
  | TextSectionMediaBlocks_ColorThemeRecord_Fragment
  | TextSectionMediaBlocks_CtaBannerRecord_Fragment
  | TextSectionMediaBlocks_FaqGroupRecord_Fragment
  | TextSectionMediaBlocks_FaqItemRecord_Fragment
  | TextSectionMediaBlocks_FeatureGridRecord_Fragment
  | TextSectionMediaBlocks_GlobalSettingRecord_Fragment
  | TextSectionMediaBlocks_HeroImageBlockRecord_Fragment
  | TextSectionMediaBlocks_HeroSectionRecord_Fragment
  | TextSectionMediaBlocks_ImageBlockRecord_Fragment
  | TextSectionMediaBlocks_ImageGalleryBlockRecord_Fragment
  | TextSectionMediaBlocks_LinkRecord_Fragment
  | TextSectionMediaBlocks_LogoGridRecord_Fragment
  | TextSectionMediaBlocks_NavItemModularRecord_Fragment
  | TextSectionMediaBlocks_NavItemSimpleRecord_Fragment
  | TextSectionMediaBlocks_NavigationRecord_Fragment
  | TextSectionMediaBlocks_PageRecord_Fragment
  | TextSectionMediaBlocks_PostRecord_Fragment
  | TextSectionMediaBlocks_PricingCardRecord_Fragment
  | TextSectionMediaBlocks_PricingSectionRecord_Fragment
  | TextSectionMediaBlocks_RedirectRecord_Fragment
  | TextSectionMediaBlocks_ReviewsSectionRecord_Fragment
  | TextSectionMediaBlocks_SchemaMigrationRecord_Fragment
  | TextSectionMediaBlocks_SocialLinkRecord_Fragment
  | TextSectionMediaBlocks_StatCardRecord_Fragment
  | TextSectionMediaBlocks_StatsSectionRecord_Fragment
  | TextSectionMediaBlocks_StepCardRecord_Fragment
  | TextSectionMediaBlocks_StepsSectionRecord_Fragment
  | TextSectionMediaBlocks_TabItemRecord_Fragment
  | TextSectionMediaBlocks_TabsSectionRecord_Fragment
  | TextSectionMediaBlocks_TeamSectionRecord_Fragment
  | TextSectionMediaBlocks_TextHeaderRecord_Fragment
  | TextSectionMediaBlocks_TextSectionRecord_Fragment
  | TextSectionMediaBlocks_UserReviewRecord_Fragment
  | TextSectionMediaBlocks_VideoBlockRecord_Fragment
;

export type TextSectionBlockFragmentFragment = { id: string, hasTextHeader: boolean, textHeaderSection: Array<{ __typename: 'TextHeaderRecord', id: string, title: string | null, hasDescription: boolean, description: string | null, hasSectionId: boolean, sectionId: string | null }>, body: { value: unknown, inlineBlocks: Array<string>, links: Array<{ __typename: 'PageRecord', id: string, title: string | null, slug: string | null }>, blocks: Array<
      | { __typename: 'ImageBlockRecord', id: string, asset: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null, assetDesktop: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null }
      | { __typename: 'ImageGalleryBlockRecord', id: string, assets: Array<{ url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null }> }
      | { __typename: 'VideoBlockRecord', id: string, _editingUrl?: string | null, asset: { url: string, title: string | null, width: number | null, height: number | null, video: { muxPlaybackId: string, streamingUrl: string, mp4Url: string | null, thumbnailUrl: string, width: number, height: number, duration: number | null } | null } | null }
    > } | null };

export type PageBySlugQueryVariables = Exact<{
  slug: string;
  locale: Types.SiteLocale;
  withEditingUrl: boolean;
}>;


export type PageBySlugQuery = { page: { id: string, title: string | null, slug: string | null, heroPage: { __typename: 'HeroSectionRecord', id: string, layoutHero: string | null, titleHero: string | null, showButton: boolean, showImageHero: boolean, showImageOverlay: boolean, subtitleHero: { value: unknown, blocks: Array<string>, links: Array<string>, inlineBlocks: Array<string> } | null, buttonHero: Array<{ __typename: 'LinkRecord', id: string, ctaLabel: string | null, typeContent: string | null, externalLink: string | null, openInNewTab: boolean, ctaLinkAria: string | null, internalLinkPage: { __typename: 'PageRecord', slug: string | null } | null, internalLinkPost: { __typename: 'PostRecord', postSlug: string | null } | null, internalLinkCategory: { __typename: 'CategoryRecord', categorySlug: string | null } | null, internalLinkAuthor: { __typename: 'AuthorRecord', authorSlug: string | null } | null }>, imageHero: { __typename: 'HeroImageBlockRecord', id: string, assetMobile: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null, assetDesktop: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null } | null, imageOverlay: { __typename: 'HeroImageBlockRecord', id: string, assetMobile: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null, assetDesktop: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null } | null } | null, contentPage: Array<
      | { __typename: 'BlogPostsSectionRecord', id: string, fetchMode: string | null, allCategoriesLabel: string | null, categoryDisplay: string | null, showSortTabs: boolean, hasLimit: boolean, limit: number | null, displayType: string | null, initialCount: number | null, loadMoreStep: number | null, loadMoreLabel: string | null, textHeaderSection: Array<{ __typename: 'TextHeaderRecord', id: string, title: string | null, hasDescription: boolean, description: string | null, hasSectionId: boolean, sectionId: string | null }>, carouselOptions: Array<{ __typename: 'CarouselSettingRecord', id: string, autoplay: boolean, autoplayInterval: number | null, showArrows: boolean, showDots: boolean, loop: boolean }>, selectedCategories: Array<{ id: string, categoryName: string | null, categorySlug: string | null, categoryColor: { hex: string } | null }>, manualPosts: Array<{ id: string, _firstPublishedAt: string, _updatedAt: string, postTitle: string | null, postSlug: string | null, excerpt: string | null, postAuthor: { authorName: string | null } | null, postCategory: Array<{ id: string, categoryName: string | null, categorySlug: string | null, categoryColor: { hex: string } | null }>, coverImage: { __typename: 'CardImageBlockRecord', id: string, assetMobile: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null, assetDesktop: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null } | null }> }
      | { __typename: 'CtaBannerRecord', id: string, hasEyebrow: boolean, eyebrow: string | null, advancedOptions: boolean, variant: string | null, bgTheme: string | null, hasImage: boolean, textHeaderSection: Array<{ __typename: 'TextHeaderRecord', id: string, title: string | null, hasDescription: boolean, description: string | null, hasSectionId: boolean, sectionId: string | null }>, buttons: Array<{ __typename: 'LinkRecord', id: string, ctaLabel: string | null, typeContent: string | null, externalLink: string | null, openInNewTab: boolean, ctaLinkAria: string | null, internalLinkPage: { __typename: 'PageRecord', slug: string | null } | null, internalLinkPost: { __typename: 'PostRecord', postSlug: string | null } | null, internalLinkCategory: { __typename: 'CategoryRecord', categorySlug: string | null } | null, internalLinkAuthor: { __typename: 'AuthorRecord', authorSlug: string | null } | null }>, imageBanner: Array<{ __typename: 'BannerImageBlockRecord', id: string, assetMobile: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null, assetDesktop: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null }> }
      | { __typename: 'FaqGroupRecord', id: string, advancedOptions: boolean, accordionMode: string | null, openFirstItem: boolean, enableFaqSchema: boolean, headerAlignment: string | null, textHeaderSection: Array<{ __typename: 'TextHeaderRecord', id: string, title: string | null, hasDescription: boolean, description: string | null, hasSectionId: boolean, sectionId: string | null }>, questions: Array<{ id: string, question: { value: unknown } | null, answer: { value: unknown } | null }> }
      | { __typename: 'FeatureGridRecord', id: string, advancedOptions: boolean, variant: string | null, textHeaderSection: Array<{ __typename: 'TextHeaderRecord', id: string, title: string | null, hasDescription: boolean, description: string | null, hasSectionId: boolean, sectionId: string | null }>, carouselOptions: Array<{ __typename: 'CarouselSettingRecord', id: string, autoplay: boolean, autoplayInterval: number | null, showArrows: boolean, showDots: boolean, loop: boolean }>, itemsFeatureGrid: Array<{ __typename: 'CardRecord', id: string, titleCard: string | null, hasIcon: boolean, iconCard: unknown, hasDescription: boolean, descriptionCard: string | null, hasImage: boolean, hasLink: boolean, imageCard: { __typename: 'CardImageBlockRecord', id: string, assetMobile: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null, assetDesktop: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null } | null, linkCard: { __typename: 'LinkRecord', id: string, ctaLabel: string | null, typeContent: string | null, externalLink: string | null, openInNewTab: boolean, ctaLinkAria: string | null, internalLinkPage: { __typename: 'PageRecord', slug: string | null } | null, internalLinkPost: { __typename: 'PostRecord', postSlug: string | null } | null, internalLinkCategory: { __typename: 'CategoryRecord', categorySlug: string | null } | null, internalLinkAuthor: { __typename: 'AuthorRecord', authorSlug: string | null } | null } | null }> }
      | { __typename: 'LogoGridRecord', id: string, grayscale: boolean, layoutStyle: string | null, textHeaderSection: Array<{ __typename: 'TextHeaderRecord', id: string, title: string | null, hasDescription: boolean, description: string | null, hasSectionId: boolean, sectionId: string | null }>, logos: Array<{ __typename: 'ImageBlockRecord', id: string, asset: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null, assetDesktop: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null }> }
      | { __typename: 'PricingSectionRecord', id: string, textHeaderSection: Array<{ __typename: 'TextHeaderRecord', id: string, title: string | null, hasDescription: boolean, description: string | null, hasSectionId: boolean, sectionId: string | null }>, plans: Array<{ __typename: 'PricingCardRecord', id: string, name: string | null, hasDescription: boolean, description: string | null, priceType: string | null, currency: string | null, amount: number | null, billingPeriod: string | null, isPopular: boolean, features: string | null, hasButton: boolean, ctaButton: Array<{ __typename: 'LinkRecord', id: string, ctaLabel: string | null, typeContent: string | null, externalLink: string | null, openInNewTab: boolean, ctaLinkAria: string | null, internalLinkPage: { __typename: 'PageRecord', slug: string | null } | null, internalLinkPost: { __typename: 'PostRecord', postSlug: string | null } | null, internalLinkCategory: { __typename: 'CategoryRecord', categorySlug: string | null } | null, internalLinkAuthor: { __typename: 'AuthorRecord', authorSlug: string | null } | null }> }> }
      | { __typename: 'ReviewsSectionRecord', id: string, allowSubmissions: boolean, textHeaderSection: Array<{ __typename: 'TextHeaderRecord', id: string, title: string | null, hasDescription: boolean, description: string | null, hasSectionId: boolean, sectionId: string | null }>, reviews: Array<{ id: string, authorName: string | null, rating: number | null, comment: string | null, authorAvatar: { url: string, alt: string | null, width: number | null, height: number | null } | null }> }
      | { __typename: 'StatsSectionRecord', id: string, textHeaderSection: Array<{ __typename: 'TextHeaderRecord', id: string, title: string | null, hasDescription: boolean, description: string | null, hasSectionId: boolean, sectionId: string | null }>, stats: Array<{ __typename: 'StatCardRecord', id: string, value: string | null, label: string | null, hasDescription: boolean, description: string | null }> }
      | { __typename: 'StepsSectionRecord', id: string, textHeaderSection: Array<{ __typename: 'TextHeaderRecord', id: string, title: string | null, hasDescription: boolean, description: string | null, hasSectionId: boolean, sectionId: string | null }>, steps: Array<{ __typename: 'StepCardRecord', id: string, title: string | null, hasDescription: boolean, description: string | null, hasImage: boolean, mediaImage: Array<{ __typename: 'CardImageBlockRecord', id: string, assetMobile: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null, assetDesktop: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null }> }> }
      | { __typename: 'TabsSectionRecord', id: string, textHeaderSection: Array<{ __typename: 'TextHeaderRecord', id: string, title: string | null, hasDescription: boolean, description: string | null, hasSectionId: boolean, sectionId: string | null }>, tabs: Array<{ __typename: 'TabItemRecord', id: string, labelTab: string | null, title: string | null, hasDescription: boolean, description: string | null, hasLink: boolean, hasImage: boolean, ctaLink: { __typename: 'LinkRecord', id: string, ctaLabel: string | null, typeContent: string | null, externalLink: string | null, openInNewTab: boolean, ctaLinkAria: string | null, internalLinkPage: { __typename: 'PageRecord', slug: string | null } | null, internalLinkPost: { __typename: 'PostRecord', postSlug: string | null } | null, internalLinkCategory: { __typename: 'CategoryRecord', categorySlug: string | null } | null, internalLinkAuthor: { __typename: 'AuthorRecord', authorSlug: string | null } | null } | null, mediaImage: { __typename: 'CardImageBlockRecord', id: string, assetMobile: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null, assetDesktop: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null } | null }> }
      | { __typename: 'TeamSectionRecord', id: string, textHeaderSection: Array<{ __typename: 'TextHeaderRecord', id: string, title: string | null, hasDescription: boolean, description: string | null, hasSectionId: boolean, sectionId: string | null }>, members: Array<{ id: string, authorName: string | null, authorSlug: string | null, authorRole: string | null, avatarBio: { __typename: 'ImageBlockRecord', id: string, asset: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null, assetDesktop: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null } | null, authorSocialLinks: Array<{ id: string, plataforma: string | null, url: string | null, openInNewTab: boolean, linkAria: string | null, image: { url: string, alt: string | null, width: number | null, height: number | null } | null }> }> }
      | { __typename: 'TextSectionRecord', id: string, hasTextHeader: boolean, textHeaderSection: Array<{ __typename: 'TextHeaderRecord', id: string, title: string | null, hasDescription: boolean, description: string | null, hasSectionId: boolean, sectionId: string | null }>, body: { value: unknown, inlineBlocks: Array<string>, links: Array<{ __typename: 'PageRecord', id: string, title: string | null, slug: string | null }>, blocks: Array<
            | { __typename: 'ImageBlockRecord', id: string, asset: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null, assetDesktop: { url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null } | null }
            | { __typename: 'ImageGalleryBlockRecord', id: string, assets: Array<{ url: string, alt: string | null, width: number | null, height: number | null, blurUpThumb: string | null }> }
            | { __typename: 'VideoBlockRecord', id: string, _editingUrl?: string | null, asset: { url: string, title: string | null, width: number | null, height: number | null, video: { muxPlaybackId: string, streamingUrl: string, mp4Url: string | null, thumbnailUrl: string, width: number, height: number, duration: number | null } | null } | null }
          > } | null }
    >, seoSettingsSocial: { title: string | null, description: string | null, twitterCard: string | null, noIndex: boolean | null, image: { url: string, alt: string | null, width: number | null, height: number | null } | null } | null, _seoMetaTags: Array<{ tag: string, attributes: Record<string, string> | null, content: string | null }>, _allSlugLocales: Array<{ locale: Types.SiteLocale | null, value: string | null }> | null } | null, _site: { faviconMetaTags: Array<{ tag: string, attributes: Record<string, string> | null, content: string | null }> } };
