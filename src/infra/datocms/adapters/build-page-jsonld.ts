import { getOrganizationName, getSiteBaseUrl } from "@/lib/seo/site-config";

/**
 * Adaptador: Page DatoCMS → JSON-LD (WebPage + BreadcrumbList) para o SeoManager.
 */

export type PageJsonLdInput = {
  /** Caminho público absoluto a partir da raiz (ex.: `/en/page-two`). */
  path: string;
  title: string;
  description?: string | null;
  /** Segmentos intermédios entre Home e a página actual (nome + path). */
  breadcrumbTrail?: { name: string; path: string }[];
};

export function buildPageWebPageJsonLd(input: PageJsonLdInput): Record<string, unknown>[] {
  const base = getSiteBaseUrl();
  const pathname = input.path.startsWith("/") ? input.path : `/${input.path}`;
  const url = new URL(pathname, `${base}/`).toString();
  const publisherName = getOrganizationName();

  const webPage: Record<string, unknown> = {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: input.title,
    isPartOf: { "@id": `${base}/#website` },
    ...(input.description ? { description: input.description } : {}),
    publisher: {
      "@type": "Organization",
      name: publisherName,
      url: base,
    },
  };

  const crumbs: { name: string; path: string }[] = [
    { name: "Home", path: "/" },
    ...(input.breadcrumbTrail ?? []),
    { name: input.title, path: pathname },
  ];

  const breadcrumb: Record<string, unknown> = {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: new URL(c.path.startsWith("/") ? c.path : `/${c.path}`, `${base}/`).toString(),
    })),
  };

  return [webPage, breadcrumb];
}
