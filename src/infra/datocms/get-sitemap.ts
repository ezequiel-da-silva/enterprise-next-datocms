import type { AppLocale } from "@/constants/i18n";
import { datocmsFetch } from "@/infra/datocms/client";
import { SITEMAP_SOURCES } from "@/infra/datocms/queries";
import { cmsPageCanonicalPath } from "@/lib/datocms/cms-page-path";
import { cache } from "react";
import type { MetadataRoute } from "next";

const SITEMAP_TAG = "datocms:sitemap";

type DatoLocaleKey = "en" | "pt_BR" | "es";

type SlugRow = { slug: string | null; _updatedAt: string };
type PostRow = { postSlug: string | null; _updatedAt: string };
type AuthorRow = { authorSlug: string | null; _updatedAt: string };

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
};

function maxDate(a: Date, b: Date): Date {
  return a.getTime() >= b.getTime() ? a : b;
}

function mergePagesBySlug(rows: SlugRow[][]): Map<string, Date> {
  const map = new Map<string, Date>();
  for (const list of rows) {
    for (const row of list) {
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

const loadSitemap = cache(async (): Promise<MetadataRoute.Sitemap> => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const base = new URL(baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl);

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

  const pageBuckets: [DatoLocaleKey, SlugRow[]][] = [
    ["en", d.pagesEn],
    ["pt_BR", d.pagesPtBR],
    ["es", d.pagesEs],
  ];
  for (const [datoKey, rows] of pageBuckets) {
    const appLocale = appLocaleFromDatoKey(datoKey);
    for (const row of rows) {
      const slug = row.slug?.trim();
      if (!slug) continue;
      entries.push({
        url: new URL(cmsPageCanonicalPath(slug, appLocale), base).toString(),
        lastModified: new Date(row._updatedAt),
        changeFrequency: slug.toLowerCase() === "home" ? "daily" : "monthly",
        priority: slug.toLowerCase() === "home" ? 0.9 : 0.5,
      });
    }
  }

  const postBuckets: [DatoLocaleKey, PostRow[]][] = [
    ["en", d.postsEn],
    ["pt_BR", d.postsPtBR],
    ["es", d.postsEs],
  ];
  for (const [datoKey, rows] of postBuckets) {
    const appLocale = appLocaleFromDatoKey(datoKey);
    for (const row of rows) {
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

  const authorBuckets: [DatoLocaleKey, AuthorRow[]][] = [
    ["en", d.authorsEn],
    ["pt_BR", d.authorsPtBR],
    ["es", d.authorsEs],
  ];
  const authorSeen = new Set<string>();
  for (const [datoKey, rows] of authorBuckets) {
    const appLocale = appLocaleFromDatoKey(datoKey);
    for (const row of rows) {
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
