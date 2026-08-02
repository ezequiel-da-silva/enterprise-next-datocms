import { getSiteBaseUrl } from "@/lib/seo/site-config";

type StaticPageType = "WebPage" | "ContactPage";

export function buildStaticPageJsonLd(
  type: StaticPageType,
  name: string,
  path: string,
  description?: string,
): Record<string, unknown>[] {
  const base = getSiteBaseUrl();
  const pathname = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(pathname, `${base}/`).toString();

  const page: Record<string, unknown> = {
    "@type": type,
    "@id": `${url}#webpage`,
    url,
    name,
    isPartOf: { "@id": `${base}/#website` },
    ...(description ? { description } : {}),
  };

  return [page];
}
