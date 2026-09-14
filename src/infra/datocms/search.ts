import { DEFAULT_APP_LOCALE, toDatoSiteLocale, type AppLocale } from "@/constants/i18n";
import { datocmsFetch } from "@/infra/datocms/client";
import { SEARCH_LEGAL_PAGES, SEARCH_SITE } from "@/infra/datocms/queries";
import { cmsPageCanonicalPath } from "@/lib/datocms/cms-page-path";
import type { SearchHit, SearchResultsPayload } from "@/lib/datocms/search-hit";

type SearchSiteData = {
  pages: { id: string; title: string; slug: string | null }[];
  legalPages?: { id: string; title: string; slug: string | null }[];
  posts: { id: string; postTitle: string; postSlug: string | null }[];
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

  for (const p of data.legalPages ?? []) {
    const slug = p.slug?.trim();
    if (!slug) continue;
    push({ id: p.id, title: p.title, href: pageHref(slug, locale), kind: "page" });
  }

  for (const p of data.posts) {
    const slug = p.postSlug?.trim();
    if (!slug) continue;
    push({
      id: p.id,
      title: p.postTitle,
      href: `/${locale}/blog/${slug}`,
      kind: "post",
    });
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
    variables: { q, locale: toDatoSiteLocale(locale) },
    tags: [SEARCH_TAG, `search:${q.toLowerCase()}`],
    revalidate: 120,
  });

  if ("errors" in result) {
    return { hits: [], error: result.errors[0]?.message };
  }

  const legalResult = await datocmsFetch<{
    allLegalPages: { id: string; title: string; slug: string | null }[];
  }>({
    query: SEARCH_LEGAL_PAGES,
    variables: { q, locale: toDatoSiteLocale(locale) },
    tags: [SEARCH_TAG, `search:${q.toLowerCase()}`],
    revalidate: 120,
  });

  const legalPages = "errors" in legalResult ? [] : legalResult.data.allLegalPages;

  return { hits: mergeHits({ ...result.data, legalPages }, locale) };
}

export function searchRevalidateTags(query: string): string[] {
  return [SEARCH_TAG, `search:${query.trim().toLowerCase()}`];
}
