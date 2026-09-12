import { DEFAULT_APP_LOCALE, type AppLocale } from "@/constants/i18n";
import { datocmsFetch } from "@/infra/datocms/client";
import { SEARCH_SITE } from "@/infra/datocms/queries";
import { cmsPageCanonicalPath } from "@/lib/datocms/cms-page-path";
import type { SearchHit, SearchResultsPayload } from "@/lib/datocms/search-hit";

type SearchSiteData = {
  pages: { id: string; title: string; slug: string | null }[];
  postsEn: { id: string; postTitle: string; postSlug: string | null }[];
  postsPtBR: { id: string; postTitle: string; postSlug: string | null }[];
  postsEs: { id: string; postTitle: string; postSlug: string | null }[];
  authors: { id: string; authorName: string; authorSlug: string | null }[];
};

const SEARCH_TAG = "datocms:search";

function pageHref(slug: string, locale: AppLocale): string {
  return cmsPageCanonicalPath(slug, locale);
}

function mergeHits(data: SearchSiteData, locale: AppLocale): SearchHit[] {
  const seen = new Set<string>();
  const out: SearchHit[] = [];

  const push = (hit: SearchHit) => {
    if (seen.has(hit.href)) return;
    seen.add(hit.href);
    out.push(hit);
  };

  for (const p of data.pages) {
    const slug = p.slug?.trim();
    if (!slug) continue;
    push({ id: p.id, title: p.title, href: pageHref(slug, locale), kind: "page" });
  }

  const postLocales: [AppLocale, keyof SearchSiteData][] = [
    ["en", "postsEn"],
    ["pt", "postsPtBR"],
    ["es", "postsEs"],
  ];

  for (const [postLocale, key] of postLocales) {
    const rows = data[key] as SearchSiteData["postsEn"];
    for (const p of rows) {
      const slug = p.postSlug?.trim();
      if (!slug) continue;
      push({
        id: `${p.id}-${postLocale}`,
        title: p.postTitle,
        href: `/${postLocale}/blog/${slug}`,
        kind: "post",
      });
    }
  }

  for (const a of data.authors) {
    const slug = a.authorSlug?.trim();
    if (!slug) continue;
    push({
      id: a.id,
      title: a.authorName,
      href: `/${locale}/blog/author/${slug}`,
      kind: "author",
    });
  }

  return out;
}

export type { SearchResultsPayload };

export async function searchSite(
  query: string,
  locale: AppLocale = DEFAULT_APP_LOCALE,
): Promise<SearchResultsPayload> {
  const q = query.trim();
  if (q.length < 2) {
    return { hits: [] };
  }

  const result = await datocmsFetch<SearchSiteData>({
    query: SEARCH_SITE,
    variables: { q },
    tags: [SEARCH_TAG, `search:${q.toLowerCase()}`],
    revalidate: 120,
  });

  if ("errors" in result) {
    return { hits: [], error: result.errors[0]?.message };
  }

  return { hits: mergeHits(result.data, locale) };
}

export function searchRevalidateTags(query: string): string[] {
  return [SEARCH_TAG, `search:${query.trim().toLowerCase()}`];
}
