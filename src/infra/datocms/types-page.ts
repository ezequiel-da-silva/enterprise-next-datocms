import type { TitleMetaLinkTag } from "react-datocms/seo";
import type { PageBySlugQuery } from "@/infra/datocms/generated/operations.types";
import type {
  CtaBannerRecord,
  ImageBlockRecord,
  ImageGalleryBlockRecord,
  TabsSectionRecord,
  VideoBlockRecord,
} from "@/infra/datocms/generated/schema.types";

type RequiredTypename<T extends { __typename?: string }, N extends string> = Omit<T, "__typename"> & {
  __typename: N;
};

type PageQueryData = NonNullable<PageBySlugQuery["page"]>;

/** Campos de ficheiro usados nas queries (subset de `FileField`). */
export type FileFieldLike = {
  url: string;
  alt?: string | null;
  title?: string | null;
  width?: number | null;
  height?: number | null;
  blurUpThumb?: string | null;
} | null;

export type SeoSettingsSocial = PageQueryData["seoSettingsSocial"];

export type LinkBlockRecord = NonNullable<
  NonNullable<PageQueryData["heroPage"]>["buttonHero"]
>[number];

export type CardIconJson = {
  prefix?: string;
  iconName?: string;
};

/** Secções do Modular Content `contentPage`. */
export type PageContentBlock = PageQueryData["contentPage"][number];

/**
 * União do renderer partilhado: secções da Page + média do ST de Post.
 */
export type PageStructuredTextBlock =
  | PageContentBlock
  | RequiredTypename<TabsSectionRecord, "TabsSectionRecord">
  | RequiredTypename<ImageBlockRecord, "ImageBlockRecord">
  | RequiredTypename<ImageGalleryBlockRecord, "ImageGalleryBlockRecord">
  | RequiredTypename<VideoBlockRecord, "VideoBlockRecord">;

export type FeatureGridRecord = Extract<PageContentBlock, { __typename: "FeatureGridRecord" }>;

export type FaqGroupBlockRecord = Extract<PageContentBlock, { __typename: "FaqGroupRecord" }>;

export type CtaBannerBlockRecord = CtaBannerRecord;

export type LogoGridBlockRecord = Extract<PageContentBlock, { __typename: "LogoGridRecord" }>;

export type ReviewsSectionBlockRecord = Extract<PageContentBlock, { __typename: "ReviewsSectionRecord" }>;

export type PricingSectionBlockRecord = Extract<PageContentBlock, { __typename: "PricingSectionRecord" }>;

export type PricingCardBlockRecord = PricingSectionBlockRecord["plans"][number];

export type StatsSectionBlockRecord = Extract<PageContentBlock, { __typename: "StatsSectionRecord" }>;

export type StatCardBlockRecord = StatsSectionBlockRecord["stats"][number];

export type StepsSectionBlockRecord = Extract<PageContentBlock, { __typename: "StepsSectionRecord" }>;

export type StepCardBlockRecord = StepsSectionBlockRecord["steps"][number];

export type TabsSectionBlockRecord = TabsSectionRecord;
export type TabItemBlockRecord = TabsSectionBlockRecord["tabs"][number];

export type TeamSectionBlockRecord = Extract<PageContentBlock, { __typename: "TeamSectionRecord" }>;
export type TeamSectionMemberRecord = TeamSectionBlockRecord["members"][number];

export type LatestPostsSectionBlockRecord = Extract<
  PageContentBlock,
  { __typename: "LatestPostsSectionRecord" }
>;

export type CardRecord = FeatureGridRecord["itemsFeatureGrid"][number];

export type HeroSectionRecord = NonNullable<PageQueryData["heroPage"]>;

/** @deprecated Use `HeroSectionRecord` */
export type HeroSectionBlockRecord = HeroSectionRecord;

/**
 * VTT opcional no bloco vídeo.
 * CMS (follow-up): no model `video_block`, adicionar campo file `captions` (`.vtt`),
 * depois incluir em `queries.ts` / post GraphQL e correr `npm run codegen`.
 * Até lá o renderer só emite `<track>` se o CDA devolver um destes campos.
 */
export type VideoBlockWithCaptions = Extract<PageStructuredTextBlock, { __typename: "VideoBlockRecord" }> & {
  captions?: FileFieldLike;
  captionsFile?: FileFieldLike;
  subtitleFile?: FileFieldLike;
};

export type PageRecord = {
  id: PageQueryData["id"];
  title: string;
  slug: string;
  heroPage?: HeroSectionRecord | null;
  contentPage: PageContentBlock[];
  seoSettingsSocial: SeoSettingsSocial;
  _seoMetaTags: TitleMetaLinkTag[] | null;
  /** Locales com slug preenchido — base do hreflang (evita links para 404). */
  slugLocales: { locale?: string | null; value?: string | null }[];
};

export type PageBySlugQueryResult = {
  page: PageRecord | null;
  _site: PageBySlugQuery["_site"];
};

/** Normaliza a resposta CDA para o shape usado na app. */
export function normalizePageBySlugResult(data: PageBySlugQuery): PageBySlugQueryResult {
  const page = data.page;
  if (!page) {
    return { page: null, _site: data._site };
  }

  const title = page.title?.trim() ?? "";
  const slug = page.slug?.trim() ?? "";

  return {
    page: {
      id: page.id,
      title,
      slug,
      heroPage: page.heroPage,
      contentPage: page.contentPage ?? [],
      seoSettingsSocial: page.seoSettingsSocial,
      _seoMetaTags: page._seoMetaTags as TitleMetaLinkTag[] | null,
      slugLocales: page._allSlugLocales ?? [],
    },
    _site: data._site,
  };
}
