import { NAVIGATION_SELECTION } from "@/infra/datocms/navigation-query";
import { SITE_SEO_SELECTION } from "@/infra/datocms/queries";

/**
 * Chrome do layout: navigation + SEO global (`_site`).
 * `global_setting` fica numa query à parte para um campo em falta no ambiente
 * (ex.: `collections_page` ainda não promovido) não derrubar o header.
 * Content Link: `contentLink: v1` só em draft no fetch.
 */
export const GET_LAYOUT_CHROME = /* GraphQL */ `
  query GetLayoutChrome($locale: SiteLocale!) {
    navigation(locale: $locale, fallbackLocales: [en, pt_BR, es]) {
      ${NAVIGATION_SELECTION}
    }
    _site {
      ${SITE_SEO_SELECTION}
    }
  }
`;
