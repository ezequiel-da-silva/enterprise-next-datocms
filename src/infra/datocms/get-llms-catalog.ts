import { APP_LOCALES, type AppLocale } from "@/constants/i18n";
import { cdaFetchCache } from "@/infra/datocms/cda-fetch-cache";
import { datocmsFetch } from "@/infra/datocms/client";
import { LLMS_CATALOG } from "@/infra/datocms/queries";
import { cmsPageCanonicalPath } from "@/lib/datocms/cms-page-path";
import { collectionPagePath } from "@/lib/datocms/collection-page-path";
import { productPagePath } from "@/lib/datocms/product-page-path";
import { DATOCMS_CACHE_TAGS } from "@/lib/datocms/revalidate-tags";
import type { LlmsLink } from "@/lib/seo/build-llms-txt";
import { getSiteBaseUrl } from "@/lib/seo/site-config";
import { cache } from "react";

type SeoBits = { description?: string | null; noIndex?: boolean | null } | null;

type PageRow = { title?: string | null; slug?: string | null; seoSettingsSocial?: SeoBits };

type PostRow = {
  postTitle?: string | null;
  postSlug?: string | null;
  excerpt?: string | null;
  seoSettingsSocial?: { noIndex?: boolean | null } | null;
};

type CommerceRow = {
  title?: string | null;
  description?: string | null;
  shopifyHandle?: string | null;
  seo?: { noIndex?: boolean | null } | null;
};

type LlmsCatalogData = {
  pagesEn: PageRow[];
  pagesPtBR: PageRow[];
  pagesEs: PageRow[];
  postsEn: PostRow[];
  postsPtBR: PostRow[];
  postsEs: PostRow[];
  productsEn: CommerceRow[];
  productsPtBR: CommerceRow[];
  productsEs: CommerceRow[];
  collectionsEn: CommerceRow[];
  collectionsPtBR: CommerceRow[];
  collectionsEs: CommerceRow[];
  legalEn: PageRow[];
  legalPtBR: PageRow[];
  legalEs: PageRow[];
};

export type LlmsCatalog = {
  pages: LlmsLink[];
  blog: LlmsLink[];
  products: LlmsLink[];
  collections: LlmsLink[];
  policies: LlmsLink[];
};

const EMPTY: LlmsCatalog = { pages: [], blog: [], products: [], collections: [], policies: [] };

const LOCALE_KEYS: Record<AppLocale, "En" | "PtBR" | "Es"> = {
  en: "En",
  pt: "PtBR",
  es: "Es",
};

function absolute(path: string): string {
  return new URL(path, `${getSiteBaseUrl()}/`).toString();
}

function text(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function pushPage(out: LlmsLink[], locale: AppLocale, row: PageRow): void {
  if (row.seoSettingsSocial?.noIndex === true) return;
  const slug = text(row.slug);
  const title = text(row.title);
  if (!slug || !title) return;
  out.push({
    title,
    url: absolute(cmsPageCanonicalPath(slug, locale)),
    description: text(row.seoSettingsSocial?.description),
  });
}

function pushPost(out: LlmsLink[], locale: AppLocale, row: PostRow): void {
  if (row.seoSettingsSocial?.noIndex === true) return;
  const slug = text(row.postSlug);
  const title = text(row.postTitle);
  if (!slug || !title) return;
  out.push({
    title,
    url: absolute(`/${locale}/blog/${slug}`),
    description: text(row.excerpt),
  });
}

function pushCommerce(
  out: LlmsLink[],
  locale: AppLocale,
  row: CommerceRow,
  pathFor: (locale: AppLocale, handle: string) => string,
): void {
  if (row.seo?.noIndex === true) return;
  const handle = text(row.shopifyHandle);
  const title = text(row.title);
  if (!handle || !title) return;
  out.push({
    title,
    url: absolute(pathFor(locale, handle)),
    description: text(row.description),
  });
}

function rows<T>(data: LlmsCatalogData, prefix: string, locale: AppLocale): T[] {
  const key = `${prefix}${LOCALE_KEYS[locale]}` as keyof LlmsCatalogData;
  return (data[key] as T[] | undefined) ?? [];
}

const loadLlmsCatalog = cache(async (): Promise<LlmsCatalog> => {
  const result = await datocmsFetch<LlmsCatalogData>({
    query: LLMS_CATALOG,
    ...cdaFetchCache({
      includeDrafts: false,
      tags: [DATOCMS_CACHE_TAGS.sitemap],
      revalidate: 3600,
    }),
  });
  if ("errors" in result) return EMPTY;

  const data = result.data;
  const pages: LlmsLink[] = [];
  const blog: LlmsLink[] = [];
  const products: LlmsLink[] = [];
  const collections: LlmsLink[] = [];
  const policies: LlmsLink[] = [];

  for (const locale of APP_LOCALES) {
    for (const row of rows<PageRow>(data, "pages", locale)) pushPage(pages, locale, row);
    for (const row of rows<PostRow>(data, "posts", locale)) pushPost(blog, locale, row);
    for (const row of rows<CommerceRow>(data, "products", locale)) {
      pushCommerce(products, locale, row, productPagePath);
    }
    for (const row of rows<CommerceRow>(data, "collections", locale)) {
      pushCommerce(collections, locale, row, collectionPagePath);
    }
    for (const row of rows<PageRow>(data, "legal", locale)) pushPage(policies, locale, row);
  }

  return { pages, blog, products, collections, policies };
});

export function getLlmsCatalog(): Promise<LlmsCatalog> {
  return loadLlmsCatalog();
}
