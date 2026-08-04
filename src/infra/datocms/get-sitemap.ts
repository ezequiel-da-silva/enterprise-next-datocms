import { APP_LOCALES, type AppLocale } from "@/constants/i18n";
import { datocmsFetch } from "@/infra/datocms/client";
import { SITEMAP_SOURCES } from "@/infra/datocms/queries";
import { cmsPageCanonicalPath } from "@/lib/datocms/cms-page-path";
import { getSiteBaseUrl } from "@/lib/seo/site-config";
import { cache } from "react";
import type { MetadataRoute } from "next";

const SITEMAP_TAG = "datocms:sitemap";

type DatoLocaleKey = "en" | "pt_BR" | "es";

type SeoNoIndexRow = {
  seoSettingsSocial?: { noIndex?: boolean | null } | null;
};

type SlugRow = SeoNoIndexRow & { slug: string | null; _updatedAt: string };
type PostRow = SeoNoIndexRow & { postSlug: string | null; _updatedAt: string };
type AuthorRow = SeoNoIndexRow & { authorSlug: string | null; _updatedAt: string };
type CategoryRow = SeoNoIndexRow & { categorySlug: string | null; _updatedAt: string };

type SitemapSourcesData = {
  pagesEn: SlugRow[];
  pagesPtBR: SlugRow[];
  pagesEs: SlugRow[];
  postsEn: PostRow[];
  postsPtBR: PostRow[];
  postsEs: PostRow[];
  authorsEn: AuthorRow[];
  authorsPtBR: AuthorRow[];
  authorsEs: AuthorRow[];
  categoriesEn: CategoryRow[];
  categoriesPtBR: CategoryRow[];
  categoriesEs: CategoryRow[];
};

function isIndexable(row: SeoNoIndexRow): boolean {
  return row.seoSettingsSocial?.noIndex !== true;
}

function maxDate(a: Date, b: Date): Date {
  return a.getTime() >= b.getTime() ? a : b;
}

function mergePagesBySlug(rows: SlugRow[][]): Map<string, Date> {
  const map = new Map<string, Date>();
  for (const list of rows) {
    for (const row of list) {
      if (!isIndexable(row)) continue;
      const slug = row.slug?.trim();
      if (!slug) continue;
      const t = new Date(row._updatedAt);
      const prev = map.get(slug);
      map.set(slug, prev ? maxDate(prev, t) : t);
    }
  }
  return map;
}

function appLocaleFromDatoKey(key: DatoLocaleKey): AppLocale {
  if (key === "pt_BR") return "pt";
  return key;
}

function staticRoutes(base: URL): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: new URL("/contato", base).toString(),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: new URL("/busca", base).toString(),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}

function blogIndexRoutes(base: URL, pagesMerged: Map<string, Date>): MetadataRoute.Sitemap {
  const homeUpdated = pagesMerged.get("home") ?? new Date();
  return APP_LOCALES.map((locale) => ({
    url: new URL(`/${locale}/blog`, base).toString(),
    lastModified: homeUpdated,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));
}

const loadSitemap = cache(async (): Promise<MetadataRoute.Sitemap> => {
  const base = new URL(getSiteBaseUrl());

  const result = await datocmsFetch<SitemapSourcesData>({
    query: SITEMAP_SOURCES,
    tags: [SITEMAP_TAG],
    revalidate: 3600,
  });

  if ("errors" in result) {
    return [
      {
        url: base.toString(),
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
      ...staticRoutes(base),
    ];
  }

  const d = result.data;
  const pagesMerged = mergePagesBySlug([d.pagesEn, d.pagesPtBR, d.pagesEs]);
  const entries: MetadataRoute.Sitemap = [];

  entries.push({
    url: base.toString(),
    lastModified: pagesMerged.get("home") ?? new Date(),
    changeFrequency: "daily",
    priority: 1,
  });

  entries.push(...blogIndexRoutes(base, pagesMerged));

  const pageBuckets: [DatoLocaleKey, SlugRow[]][] = [
    ["en", d.pagesEn],
    ["pt_BR", d.pagesPtBR],
    ["es", d.pagesEs],
  ];
  for (const [datoKey, rows] of pageBuckets) {
    const appLocale = appLocaleFromDatoKey(datoKey);
    for (const row of rows) {
      if (!isIndexable(row)) continue;
      const slug = row.slug?.trim();
      if (!slug || slug.toLowerCase() === "home") continue;
      entries.push({
        url: new URL(cmsPageCanonicalPath(slug, appLocale), base).toString(),
        lastModified: new Date(row._updatedAt),
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
  }

  for (const locale of APP_LOCALES) {
    entries.push({
      url: new URL(`/${locale}`, base).toString(),
      lastModified: pagesMerged.get("home") ?? new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    });
  }

  const postBuckets: [DatoLocaleKey, PostRow[]][] = [
    ["en", d.postsEn],
    ["pt_BR", d.postsPtBR],
    ["es", d.postsEs],
  ];
  for (const [datoKey, rows] of postBuckets) {
    const appLocale = appLocaleFromDatoKey(datoKey);
    for (const row of rows) {
      if (!isIndexable(row)) continue;
      const slug = row.postSlug?.trim();
      if (!slug) continue;
      entries.push({
        url: new URL(`/${appLocale}/blog/${slug}`, base).toString(),
        lastModified: new Date(row._updatedAt),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  const categoryBuckets: [DatoLocaleKey, CategoryRow[]][] = [
    ["en", d.categoriesEn],
    ["pt_BR", d.categoriesPtBR],
    ["es", d.categoriesEs],
  ];
  for (const [datoKey, rows] of categoryBuckets) {
    const appLocale = appLocaleFromDatoKey(datoKey);
    for (const row of rows) {
      if (!isIndexable(row)) continue;
      const slug = row.categorySlug?.trim();
      if (!slug) continue;
      entries.push({
        url: new URL(`/${appLocale}/blog/category/${slug}`, base).toString(),
        lastModified: new Date(row._updatedAt),
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  }

  const authorBuckets: [DatoLocaleKey, AuthorRow[]][] = [
    ["en", d.authorsEn],
    ["pt_BR", d.authorsPtBR],
    ["es", d.authorsEs],
  ];
  const authorSeen = new Set<string>();
  for (const [datoKey, rows] of authorBuckets) {
    const appLocale = appLocaleFromDatoKey(datoKey);
    for (const row of rows) {
      if (!isIndexable(row)) continue;
      const slug = row.authorSlug?.trim();
      if (!slug) continue;
      const key = `${appLocale}:${slug}`;
      if (authorSeen.has(key)) continue;
      authorSeen.add(key);
      entries.push({
        url: new URL(`/${appLocale}/blog/author/${slug}`, base).toString(),
        lastModified: new Date(row._updatedAt),
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
  }

  entries.push(...staticRoutes(base));

  return entries;
});

export function getSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  return loadSitemap();
}

/** Tags para `revalidateTag` após publicações no Dato (opcional). */
export function sitemapRevalidateTags(): string[] {
  return [SITEMAP_TAG];
}
