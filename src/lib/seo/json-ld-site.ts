import type { AppLocale } from "@/constants/i18n";
import { getOrganizationName, getSearchPath, getSiteBaseUrl, getSiteName } from "@/lib/seo/site-config";
import { schemaLanguage } from "@/lib/seo/locale-tags";

/**
 * Organization + WebSite (SearchAction) para layout — crawlers e motores de resposta (AEO).
 */
export function buildSiteJsonLdGraph(locale: AppLocale): Record<string, unknown>[] {
  const base = getSiteBaseUrl();
  const name = getOrganizationName();
  const siteLabel = getSiteName();
  const searchUrl = new URL(getSearchPath(), `${base}/`).toString();

  const organization: Record<string, unknown> = {
    "@type": "Organization",
    "@id": `${base}/#organization`,
    name,
    url: base,
  };

  const logoUrl = process.env.NEXT_PUBLIC_ORGANIZATION_LOGO_URL?.trim();
  if (logoUrl) {
    organization.logo = { "@type": "ImageObject", url: logoUrl };
  }

  const sameAsRaw = process.env.NEXT_PUBLIC_ORGANIZATION_SAME_AS?.trim();
  if (sameAsRaw) {
    const sameAs = sameAsRaw
      .split(",")
      .map((u) => u.trim())
      .filter(Boolean);
    if (sameAs.length > 0) {
      organization.sameAs = sameAs;
    }
  }

  const website: Record<string, unknown> = {
    "@type": "WebSite",
    "@id": `${base}/#website`,
    url: base,
    name: siteLabel,
    inLanguage: schemaLanguage(locale),
    publisher: { "@id": `${base}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${searchUrl}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return [organization, website];
}
