import type { AppLocale } from "@/constants/i18n";
import { buildLocaleBreadcrumbTrail, type BreadcrumbCrumb } from "@/lib/seo/breadcrumb-labels";
import { schemaLanguage } from "@/lib/seo/locale-tags";
import { getSiteBaseUrl } from "@/lib/seo/site-config";

function toAbsoluteUrl(path: string): string {
  const base = getSiteBaseUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalized, `${base}/`).toString();
}

export function buildBreadcrumbListJsonLd(crumbs: BreadcrumbCrumb[]): Record<string, unknown> {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: toAbsoluteUrl(c.path),
    })),
  };
}

export type ListingItem = {
  name: string;
  path: string;
};

const ITEM_LIST_CAP = 20;

export function buildListingPageJsonLd(
  locale: AppLocale,
  path: string,
  title: string,
  middle?: BreadcrumbCrumb[],
  items?: ListingItem[],
): Record<string, unknown>[] {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const url = toAbsoluteUrl(normalized);
  const crumbs = buildLocaleBreadcrumbTrail(locale, { name: title, path: normalized }, middle);

  const webPage: Record<string, unknown> = {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: title,
    inLanguage: schemaLanguage(locale),
    isPartOf: { "@id": `${getSiteBaseUrl()}/#website` },
  };

  const graph: Record<string, unknown>[] = [webPage, buildBreadcrumbListJsonLd(crumbs)];

  if (items && items.length > 0) {
    const capped = items.slice(0, ITEM_LIST_CAP);
    graph.push({
      "@type": "ItemList",
      "@id": `${url}#itemlist`,
      numberOfItems: capped.length,
      itemListElement: capped.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
        url: toAbsoluteUrl(item.path),
      })),
    });
  }

  return graph;
}
