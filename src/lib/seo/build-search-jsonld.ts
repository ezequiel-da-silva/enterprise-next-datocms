import type { AppLocale } from "@/constants/i18n";
import { buildLocaleBreadcrumbTrail } from "@/lib/seo/breadcrumb-labels";
import { buildBreadcrumbListJsonLd } from "@/lib/seo/build-listing-page-jsonld";
import { getSiteBaseUrl, getSiteName } from "@/lib/seo/site-config";

/** WebPage + BreadcrumbList for search (AEO). */
export function buildSearchPageJsonLd(locale: AppLocale, query?: string): Record<string, unknown>[] {
  const base = getSiteBaseUrl();
  const url = new URL("/busca", `${base}/`);
  if (query?.trim()) {
    url.searchParams.set("q", query.trim());
  }
  const pageName = query?.trim() ? `Busca: ${query.trim()}` : "Busca";
  const path = query?.trim() ? `/busca?q=${encodeURIComponent(query.trim())}` : "/busca";

  const webPage: Record<string, unknown> = {
    "@type": "WebPage",
    "@id": `${url.toString()}#webpage`,
    url: url.toString(),
    name: pageName,
    isPartOf: { "@id": `${base}/#website` },
    about: {
      "@type": "WebSite",
      name: getSiteName(),
      url: base,
    },
  };

  const crumbs = buildLocaleBreadcrumbTrail(locale, {
    name: query?.trim() ? `Busca: ${query.trim()}` : "Busca",
    path,
  });

  return [webPage, buildBreadcrumbListJsonLd(crumbs)];
}
