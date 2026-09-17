import { APP_LOCALES, type AppLocale } from "@/constants/i18n";
import { toDatoSiteLocale } from "@/constants/i18n";
import { datocmsFetch } from "@/infra/datocms/client";
import {
  LIST_AUTHOR_SLUGS,
  LIST_CATEGORY_SLUGS,
  LIST_COLLECTION_HANDLES,
  LIST_LEGAL_PAGE_SLUGS,
  LIST_PRODUCT_HANDLES,
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
  const legal = await listLegalPageSlugRows();
  for (const row of legal) {
    const slug = row.slug?.trim();
    if (!slug || RESERVED_APP_LOCALE_SLUGS.has(slug) || merged.has(slug)) continue;
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
  const legal = await listLegalPageSlugRows();
  const seen = new Set(out.map((row) => `${row.slug}:${row.pageSlug}`));
  for (const locale of APP_LOCALES) {
    for (const row of legal) {
      const s = row.slug?.trim();
      if (!s || RESERVED_APP_LOCALE_SLUGS.has(s)) continue;
      const key = `${locale}:${s}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ slug: locale, pageSlug: s });
    }
  }
  return out;
}

type ProductHandleRow = { shopifyHandle: string | null };

/** PDPs por locale (`/[locale]/products/[handle]`). O handle não é localizado. */
export async function getStaticParamsProductPages(): Promise<{ slug: string; handle: string }[]> {
  const result = await datocmsFetch<{ allProductPages: ProductHandleRow[] }>({
    query: LIST_PRODUCT_HANDLES,
    revalidate: 3600,
  });
  if ("errors" in result) return [];
  const out: { slug: string; handle: string }[] = [];
  for (const locale of APP_LOCALES) {
    for (const row of result.data.allProductPages) {
      const handle = row.shopifyHandle?.trim();
      if (handle) out.push({ slug: locale, handle });
    }
  }
  return out;
}

/** PLPs por locale (`/[locale]/collections/[handle]`). O handle não é localizado. */
export async function getStaticParamsCollectionPages(): Promise<{ slug: string; handle: string }[]> {
  const result = await datocmsFetch<{ allCollectionPages: ProductHandleRow[] }>({
    query: LIST_COLLECTION_HANDLES,
    revalidate: 3600,
  });
  if ("errors" in result) return [];
  const out: { slug: string; handle: string }[] = [];
  for (const locale of APP_LOCALES) {
    for (const row of result.data.allCollectionPages) {
      const handle = row.shopifyHandle?.trim();
      if (handle) out.push({ slug: locale, handle });
    }
  }
  return out;
}

type LegalSlugRow = { slug: string | null; _updatedAt: string; seoSettingsSocial?: { noIndex?: boolean | null } | null };

async function listLegalPageSlugRows(): Promise<LegalSlugRow[]> {
  const result = await datocmsFetch<{ allLegalPages: LegalSlugRow[] }>({
    query: LIST_LEGAL_PAGE_SLUGS,
    revalidate: 3600,
  });
  if ("errors" in result) return [];
  return result.data.allLegalPages;
}
