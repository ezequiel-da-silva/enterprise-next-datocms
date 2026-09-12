import type { AppLocale } from "@/constants/i18n";
import { buildLocaleBreadcrumbTrail } from "@/lib/seo/breadcrumb-labels";
import { buildBreadcrumbListJsonLd } from "@/lib/seo/build-listing-page-jsonld";
import { schemaLanguage } from "@/lib/seo/locale-tags";
import { getSiteBaseUrl, getSiteName } from "@/lib/seo/site-config";
import { searchResultsPath } from "@/lib/datocms/search-query";

export type SearchJsonLdInput = {
  locale: AppLocale;
  /** Caminho canónico da Page de busca (sem query). */
  path: string;
  title: string;
  query?: string;
};

/** WebPage / SearchResultsPage + BreadcrumbList for search (AEO). */
export function buildSearchPageJsonLd(input: SearchJsonLdInput): Record<string, unknown>[] {
  const { locale, path, title } = input;
  const query = input.query?.trim();
  const base = getSiteBaseUrl();
  const pagePath = searchResultsPath(path, query);
  const url = new URL(pagePath, `${base}/`).toString();
  const pageName = query ? `${title}: ${query}` : title;

  const webPage: Record<string, unknown> = {
    "@type": query ? "SearchResultsPage" : "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: pageName,
    inLanguage: schemaLanguage(locale),
    isPartOf: { "@id": `${base}/#website` },
    about: {
      "@type": "WebSite",
      name: getSiteName(),
      url: base,
    },
  };

  const crumbs = buildLocaleBreadcrumbTrail(locale, {
    name: pageName,
    path: pagePath,
  });

  return [webPage, buildBreadcrumbListJsonLd(crumbs)];
}
