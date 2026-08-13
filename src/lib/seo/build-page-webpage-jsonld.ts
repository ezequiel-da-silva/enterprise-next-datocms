import type { AppLocale } from "@/constants/i18n";
import {
  buildLocaleBreadcrumbTrail,
  homeBreadcrumbLabel,
  homeBreadcrumbPath,
} from "@/lib/seo/breadcrumb-labels";
import { buildBreadcrumbListJsonLd } from "@/lib/seo/build-listing-page-jsonld";
import { schemaLanguage } from "@/lib/seo/locale-tags";
import { getOrganizationName, getSiteBaseUrl } from "@/lib/seo/site-config";

export type PageJsonLdInput = {
  path: string;
  title: string;
  description?: string | null;
  locale: AppLocale;
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
    inLanguage: schemaLanguage(input.locale),
    isPartOf: { "@id": `${base}/#website` },
    ...(input.description ? { description: input.description } : {}),
    publisher: {
      "@type": "Organization",
      name: publisherName,
      url: base,
    },
  };

  const isLocaleHome = pathname === homeBreadcrumbPath(input.locale);
  const crumbs = isLocaleHome
    ? [{ name: homeBreadcrumbLabel(input.locale), path: homeBreadcrumbPath(input.locale) }]
    : buildLocaleBreadcrumbTrail(
        input.locale,
        { name: input.title, path: pathname },
        input.breadcrumbTrail,
      );

  return [webPage, buildBreadcrumbListJsonLd(crumbs)];
}
