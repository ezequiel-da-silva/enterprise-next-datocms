import { APP_LOCALES, type AppLocale } from "@/constants/i18n";
import { toDatoSiteLocale } from "@/constants/i18n";
import { datocmsFetch } from "@/infra/datocms/client";
import {
  LIST_AUTHOR_SLUGS,
  LIST_CATEGORY_SLUGS,
  SITEMAP_SOURCES,
} from "@/infra/datocms/queries";

type SlugRow = { slug: string | null; _updatedAt: string };
type PostRow = { postSlug: string | null; _updatedAt: string };

type SitemapSourcesData = {
  pagesEn: SlugRow[];
  pagesPtBR: SlugRow[];
  pagesEs: SlugRow[];
  postsEn: PostRow[];
  postsPtBR: PostRow[];
  postsEs: PostRow[];
};

function mergePagesBySlug(rows: SlugRow[][]): Map<string, Date> {
  const map = new Map<string, Date>();
  for (const list of rows) {
    for (const row of list) {
      const slug = row.slug?.trim();
      if (!slug) continue;
      const t = new Date(row._updatedAt);
      const prev = map.get(slug);
      map.set(slug, prev ? (prev.getTime() >= t.getTime() ? prev : t) : t);
    }
  }
  return map;
}

const RESERVED_APP_LOCALE_SLUGS = new Set<string>(APP_LOCALES);

/** CMS pages (`/[slug]`), exceto `home` e slugs reservados a locale (`en`/`pt`/`es`). */
export async function getStaticParamsPages(): Promise<{ slug: string }[]> {
  const result = await datocmsFetch<SitemapSourcesData>({
    query: SITEMAP_SOURCES,
    revalidate: 3600,
  });
  if ("errors" in result) return [];
  const merged = mergePagesBySlug([result.data.pagesEn, result.data.pagesPtBR, result.data.pagesEs]);
  const out: { slug: string }[] = [];
  for (const slug of merged.keys()) {
    if (slug.toLowerCase() === "home") continue;
    if (RESERVED_APP_LOCALE_SLUGS.has(slug)) continue;
    out.push({ slug });
  }
  return out;
}

/** Posts por locale (`/[locale]/blog/[postSlug]`). */
export async function getStaticParamsBlogPosts(): Promise<{ slug: string; postSlug: string }[]> {
  const result = await datocmsFetch<SitemapSourcesData>({
    query: SITEMAP_SOURCES,
    revalidate: 3600,
  });
  if ("errors" in result) return [];
  const d = result.data;
  const buckets: [AppLocale, PostRow[]][] = [
    ["en", d.postsEn],
    ["pt", d.postsPtBR],
    ["es", d.postsEs],
  ];
  const out: { slug: string; postSlug: string }[] = [];
  for (const [locale, rows] of buckets) {
    for (const row of rows) {
      const ps = row.postSlug?.trim();
      if (ps) out.push({ slug: locale, postSlug: ps });
    }
  }
  return out;
}

type CategorySlugRow = { categorySlug: string | null };
type ListCategoriesData = { allCategories: CategorySlugRow[] };

export async function getStaticParamsCategories(): Promise<{ slug: string; categorySlug: string }[]> {
  const out: { slug: string; categorySlug: string }[] = [];
  for (const locale of APP_LOCALES) {
    const result = await datocmsFetch<ListCategoriesData>({
      query: LIST_CATEGORY_SLUGS,
      variables: { locale: toDatoSiteLocale(locale) },
      revalidate: 3600,
    });
    if ("errors" in result) continue;
    for (const row of result.data.allCategories) {
      const cs = row.categorySlug?.trim();
      if (cs) out.push({ slug: locale, categorySlug: cs });
    }
  }
  return out;
}

type AuthorSlugRow = { authorSlug: string | null };
type ListAuthorsData = { allAuthors: AuthorSlugRow[] };

export async function getStaticParamsAuthors(): Promise<{ slug: string; authorSlug: string }[]> {
  const out: { slug: string; authorSlug: string }[] = [];
  for (const locale of APP_LOCALES) {
    const result = await datocmsFetch<ListAuthorsData>({
      query: LIST_AUTHOR_SLUGS,
      variables: { locale: toDatoSiteLocale(locale) },
      revalidate: 3600,
    });
    if ("errors" in result) continue;
    for (const row of result.data.allAuthors) {
      const s = row.authorSlug?.trim();
      if (s) out.push({ slug: locale, authorSlug: s });
    }
  }
  return out;
}

/** Páginas CMS com prefixo de locale (`/[locale]/[pageSlug]`). */
export async function getStaticParamsLocaleCmsPages(): Promise<{ slug: string; pageSlug: string }[]> {
  const result = await datocmsFetch<SitemapSourcesData>({
    query: SITEMAP_SOURCES,
    revalidate: 3600,
  });
  if ("errors" in result) return [];
  const d = result.data;
  const buckets: [AppLocale, SlugRow[]][] = [
    ["en", d.pagesEn],
    ["pt", d.pagesPtBR],
    ["es", d.pagesEs],
  ];
  const out: { slug: string; pageSlug: string }[] = [];
  for (const [locale, rows] of buckets) {
    for (const row of rows) {
      const s = row.slug?.trim();
      if (!s) continue;
      if (s.toLowerCase() === "home") continue;
      if (RESERVED_APP_LOCALE_SLUGS.has(s)) continue;
      out.push({ slug: locale, pageSlug: s });
    }
  }
  return out;
}
