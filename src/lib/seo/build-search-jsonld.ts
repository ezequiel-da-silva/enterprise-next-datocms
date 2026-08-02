import { getSiteBaseUrl, getSiteName } from "@/lib/seo/site-config";

/** WebPage da busca — reforça SearchAction do WebSite (AEO). */
export function buildSearchPageJsonLd(query?: string): Record<string, unknown> {
  const base = getSiteBaseUrl();
  const url = new URL("/busca", `${base}/`);
  if (query?.trim()) {
    url.searchParams.set("q", query.trim());
  }

  return {
    "@type": "WebPage",
    "@id": `${url.toString()}#webpage`,
    url: url.toString(),
    name: query?.trim() ? `Busca: ${query.trim()}` : "Busca",
    isPartOf: { "@id": `${base}/#website` },
    about: {
      "@type": "WebSite",
      name: getSiteName(),
      url: base,
    },
  };
}
