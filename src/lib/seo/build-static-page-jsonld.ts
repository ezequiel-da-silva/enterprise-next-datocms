import { getSiteBaseUrl } from "@/lib/seo/site-config";
import { schemaLanguage } from "@/lib/seo/locale-tags";
import type { AppLocale } from "@/constants/i18n";

type StaticPageType = "WebPage" | "ContactPage";

export function buildStaticPageJsonLd(
  type: StaticPageType,
  name: string,
  path: string,
  description?: string,
  locale: AppLocale = "pt",
): Record<string, unknown>[] {
  const base = getSiteBaseUrl();
  const pathname = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(pathname, `${base}/`).toString();

  const page: Record<string, unknown> = {
    "@type": type,
    "@id": `${url}#webpage`,
    url,
    name,
    inLanguage: schemaLanguage(locale),
    isPartOf: { "@id": `${base}/#website` },
    ...(description ? { description } : {}),
  };

  return [page];
}
