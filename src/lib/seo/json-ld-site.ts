import { getSearchPath, getSiteBaseUrl } from "@/lib/seo/site-config";
import type { SiteIdentity } from "@/lib/seo/site-identity";
import { schemaLanguages } from "@/lib/seo/locale-tags";

/**
 * Organization + WebSite (SearchAction) para layout — crawlers e motores de resposta (AEO).
 * `inLanguage` / `availableLanguage` listam todos os locales da app; o `WebPage` de cada rota
 * continua a declarar o idioma da renderização.
 */
export function buildSiteJsonLdGraph(identity: SiteIdentity): Record<string, unknown>[] {
  const base = getSiteBaseUrl();
  const searchUrl = new URL(getSearchPath(), `${base}/`).toString();
  const languages = schemaLanguages();

  const organization: Record<string, unknown> = {
    "@type": "Organization",
    "@id": `${base}/#organization`,
    name: identity.organizationName,
    url: base,
  };

  if (identity.logoUrl) {
    organization.logo = { "@type": "ImageObject", url: identity.logoUrl };
  }

  if (identity.sameAs.length > 0) {
    organization.sameAs = identity.sameAs;
  }

  const website: Record<string, unknown> = {
    "@type": "WebSite",
    "@id": `${base}/#website`,
    url: base,
    name: identity.siteName,
    inLanguage: languages,
    availableLanguage: languages,
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
