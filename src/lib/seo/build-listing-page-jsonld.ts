import type { AppLocale } from "@/constants/i18n";
import { buildLocaleBreadcrumbTrail, type BreadcrumbCrumb } from "@/lib/seo/breadcrumb-labels";
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

export function buildListingPageJsonLd(
  locale: AppLocale,
  path: string,
  title: string,
  middle?: BreadcrumbCrumb[],
): Record<string, unknown>[] {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const url = toAbsoluteUrl(normalized);
  const crumbs = buildLocaleBreadcrumbTrail(locale, { name: title, path: normalized }, middle);

  const webPage: Record<string, unknown> = {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: title,
    isPartOf: { "@id": `${getSiteBaseUrl()}/#website` },
  };

  return [webPage, buildBreadcrumbListJsonLd(crumbs)];
}
