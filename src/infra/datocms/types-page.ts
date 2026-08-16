import type { PageBySlugQuery } from "@/infra/datocms/generated/operations.types";
import type { CtaBannerRecord } from "@/infra/datocms/generated/schema.types";
import type { CdaStructuredTextValue } from "datocms-structured-text-utils";
import type { TitleMetaLinkTag } from "react-datocms/seo";

type PageQueryData = NonNullable<PageBySlugQuery["page"]>;
type PageStructuredTextField = NonNullable<PageQueryData["structuredText"]>;

/** Campos de ficheiro usados nas queries (subset de `FileField`). */
export type FileFieldLike = {
  url: string;
  alt?: string | null;
  title?: string | null;
  width?: number | null;
  height?: number | null;
} | null;

export type SeoSettingsSocial = PageQueryData["seoSettingsSocial"];

export type LinkBlockRecord = NonNullable<
  NonNullable<PageQueryData["heroPage"]>["buttonHero"]
>[number];

export type CardIconJson = {
  prefix?: string;
  iconName?: string;
};

export type PageStructuredTextBlock = PageStructuredTextField["blocks"][number];

export type FeatureGridRecord = Extract<PageStructuredTextBlock, { __typename: "FeatureGridRecord" }>;

export type FaqGroupBlockRecord = Extract<PageStructuredTextBlock, { __typename: "FaqGroupRecord" }>;

export type CtaBannerBlockRecord = CtaBannerRecord;

export type LogoGridBlockRecord = Extract<PageStructuredTextBlock, { __typename: "LogoGridRecord" }>;

export type CardRecord = FeatureGridRecord["itemsFeatureGrid"][number];

export type HeroSectionRecord = NonNullable<PageQueryData["heroPage"]>;

/** @deprecated Use `HeroSectionRecord` */
export type HeroSectionBlockRecord = HeroSectionRecord;

/**
 * VTT opcional no bloco vídeo.
 * CMS (follow-up): no model `video_block`, adicionar campo file `captions` (`.vtt`),
 * depois incluir em `queries.ts` / `page-by-slug.graphql` e correr `npm run codegen`.
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
  structuredText: CdaStructuredTextValue | null;
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
      structuredText: page.structuredText as CdaStructuredTextValue | null,
      seoSettingsSocial: page.seoSettingsSocial,
      _seoMetaTags: page._seoMetaTags as TitleMetaLinkTag[] | null,
      slugLocales: page._allSlugLocales ?? [],
    },
    _site: data._site,
  };
}
