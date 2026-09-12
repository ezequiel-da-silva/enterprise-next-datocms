import { CmsPageArticle } from "@/components/patterns/cms-page-article";
import { submitContact } from "@/app/actions/contact";
import { submitUserReview } from "@/app/actions/submit-user-review";
import {
  APP_LOCALES,
  DEFAULT_APP_LOCALE,
  REQUEST_LOCALE_HEADER,
  appLocaleFromParam,
  isAppLocale,
  toDatoSiteLocale,
  type AppLocale,
} from "@/constants/i18n";
import { contentNeedsLatestPostsCatalog, loadLatestPostsCatalog } from "@/infra/datocms/get-blog";
import {
  contactPagePath,
  getContactPage,
  isContactPageAliasSlug,
} from "@/infra/datocms/get-contact-page";
import {
  contentNeedsSearchResults,
  getSearchPage,
  isSearchPageAliasSlug,
  searchPagePath,
} from "@/infra/datocms/get-search-page";
import { searchSite } from "@/infra/datocms/search";
import { readSearchQuery, searchResultsPath } from "@/lib/datocms/search-query";
import { getPageBySlug } from "@/infra/datocms/get-page";
import { getSiteSeo, pickSiteSeo } from "@/infra/datocms/get-site-seo";
import { buildDatoPageMetadata, cmsContentOgImage, withSearchQueryNoIndex } from "@/lib/seo/build-dato-page-metadata";
import { buildUnavailableMetadata } from "@/lib/seo/build-unavailable-metadata";
import { cmsPageCanonicalPath } from "@/lib/datocms/cms-page-path";
import { getStaticParamsPages } from "@/infra/datocms/static-params";
import { buildHreflangPathsFromSlugLocales } from "@/lib/seo/hreflang";
import { buildSiteIdentity } from "@/lib/seo/site-identity";
import { draftMode, headers } from "next/headers";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
};

export async function generateStaticParams() {
  const pages = await getStaticParamsPages();
  const localeRoots = APP_LOCALES.map((locale) => ({ slug: locale }));
  return [...localeRoots, ...pages];
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { isEnabled } = await draftMode();
  const headerStore = await headers();
  const headerLocale = appLocaleFromParam(headerStore.get(REQUEST_LOCALE_HEADER) ?? "") ?? DEFAULT_APP_LOCALE;

  const cmsLocale: AppLocale = isAppLocale(slug) ? slug : headerLocale;
  const pageSlug = isAppLocale(slug) ? "home" : slug;

  const [result, seoResult] = await Promise.all([
    getPageBySlug(pageSlug, isEnabled, cmsLocale),
    getSiteSeo(cmsLocale, isEnabled),
  ]);

  if ("errors" in result || !result.data.page) {
    return buildUnavailableMetadata("Página");
  }

  const { page, _site } = result.data;
  const siteOg = buildSiteIdentity({ seo: pickSiteSeo(seoResult) }).fallbackOgImage;
  const path = cmsPageCanonicalPath(pageSlug, cmsLocale);
  const meta = buildDatoPageMetadata({
    path,
    seoMetaTags: page._seoMetaTags,
    faviconMetaTags: _site.faviconMetaTags,
    seoSettingsSocial: page.seoSettingsSocial,
    fallbackTitle: page.title,
    fallbackOgImage: cmsContentOgImage({ hero: page.heroPage }) ?? siteOg,
    hreflangPaths: buildHreflangPathsFromSlugLocales(page.slugLocales, (l, s) =>
      cmsPageCanonicalPath(s, l),
    ),
  });
  const query = readSearchQuery((await searchParams).q);
  if (!query) return meta;
  const configuredSearchPage = await getSearchPage(cmsLocale, isEnabled);
  if (configuredSearchPage?.id !== page.id) return meta;
  return withSearchQueryNoIndex(meta, path, query);
}

export default async function DynamicPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { isEnabled } = await draftMode();
  const headerStore = await headers();
  const headerLocale = appLocaleFromParam(headerStore.get(REQUEST_LOCALE_HEADER) ?? "") ?? DEFAULT_APP_LOCALE;

  const cmsLocale: AppLocale = isAppLocale(slug) ? slug : headerLocale;
  const pageSlug = isAppLocale(slug) ? "home" : slug;

  const result = await getPageBySlug(pageSlug, isEnabled, cmsLocale);

  if ("errors" in result || !result.data.page) {
    if (isContactPageAliasSlug(pageSlug)) {
      const configuredContactPage = await getContactPage(cmsLocale, isEnabled);
      const configuredPath = contactPagePath(cmsLocale, configuredContactPage);
      if (configuredContactPage && configuredPath !== cmsPageCanonicalPath(pageSlug, cmsLocale)) {
        permanentRedirect(configuredPath);
      }
    }
    if (isSearchPageAliasSlug(pageSlug)) {
      const configuredSearchPage = await getSearchPage(cmsLocale, isEnabled);
      const configuredPath = searchPagePath(cmsLocale, configuredSearchPage);
      if (configuredSearchPage && configuredPath !== cmsPageCanonicalPath(pageSlug, cmsLocale)) {
        const query = readSearchQuery((await searchParams).q);
        permanentRedirect(searchResultsPath(configuredPath, query));
      }
    }
    if ("errors" in result) {
      notFound();
    }
  }

  const page = result.data.page;
  if (!page) {
    notFound();
  }

  const configuredContactPage = await getContactPage(cmsLocale, isEnabled);
  const configuredSearchPage = await getSearchPage(cmsLocale, isEnabled);
  if (configuredSearchPage?.id === page.id) {
    const canonical = cmsPageCanonicalPath(page.slug, cmsLocale);
    const requested = cmsPageCanonicalPath(pageSlug, cmsLocale);
    if (canonical !== requested) {
      permanentRedirect(searchResultsPath(canonical, readSearchQuery((await searchParams).q)));
    }
  }

  const latestPostsCatalog = contentNeedsLatestPostsCatalog(page.contentPage)
    ? loadLatestPostsCatalog(toDatoSiteLocale(cmsLocale), isEnabled)
    : undefined;

  const query = contentNeedsSearchResults(page.contentPage)
    ? readSearchQuery((await searchParams).q)
    : "";
  const searchResults = query ? searchSite(query, cmsLocale) : undefined;

  return (
    <CmsPageArticle
      page={page}
      locale={cmsLocale}
      canonicalPath={cmsPageCanonicalPath(pageSlug, cmsLocale)}
      contentLinkGroup={isEnabled}
      submitUserReview={submitUserReview}
      submitContact={submitContact}
      latestPostsCatalog={latestPostsCatalog}
      jsonLdPageType={configuredContactPage?.id === page.id ? "ContactPage" : "WebPage"}
      searchQuery={query || undefined}
      searchResults={searchResults}
    />
  );
}
