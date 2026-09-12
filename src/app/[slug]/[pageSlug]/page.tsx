import { CmsPageArticle } from "@/components/patterns/cms-page-article";
import { submitContact } from "@/app/actions/contact";
import { submitUserReview } from "@/app/actions/submit-user-review";
import { isAppLocale, toDatoSiteLocale, type AppLocale } from "@/constants/i18n";
import { contentNeedsLatestPostsCatalog, loadLatestPostsCatalog } from "@/infra/datocms/get-blog";
import { blogIndexPath, getBlogIndexPage } from "@/infra/datocms/get-blog-index-page";
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
import { buildHreflangPathsFromSlugLocales } from "@/lib/seo/hreflang";
import { buildSiteIdentity } from "@/lib/seo/site-identity";
import { getStaticParamsLocaleCmsPages } from "@/infra/datocms/static-params";
import { draftMode } from "next/headers";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string; pageSlug: string }>;
  searchParams: Promise<{ q?: string }>;
};

export async function generateStaticParams() {
  return getStaticParamsLocaleCmsPages();
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug, pageSlug } = await params;
  if (!isAppLocale(slug)) {
    return buildUnavailableMetadata("Página");
  }
  const locale = slug as AppLocale;
  const { isEnabled } = await draftMode();
  const [result, seoResult] = await Promise.all([
    getPageBySlug(pageSlug, isEnabled, locale),
    getSiteSeo(locale, isEnabled),
  ]);

  if ("errors" in result || !result.data.page) {
    return buildUnavailableMetadata("Página");
  }

  const { page, _site } = result.data;
  const siteOg = buildSiteIdentity({ seo: pickSiteSeo(seoResult) }).fallbackOgImage;
  const path = cmsPageCanonicalPath(pageSlug, locale);
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
  const configuredSearchPage = await getSearchPage(locale, isEnabled);
  if (configuredSearchPage?.id !== page.id) return meta;
  return withSearchQueryNoIndex(meta, path, query);
}

export default async function LocalePrefixedCmsPage({ params, searchParams }: PageProps) {
  const { slug, pageSlug } = await params;
  if (!isAppLocale(slug)) {
    notFound();
  }
  const locale = slug as AppLocale;
  const { isEnabled } = await draftMode();
  const result = await getPageBySlug(pageSlug, isEnabled, locale);

  if ("errors" in result || !result.data.page) {
    if (pageSlug.toLowerCase() === "blog") {
      const configuredBlogPage = await getBlogIndexPage(locale, isEnabled);
      const configuredPath = blogIndexPath(locale, configuredBlogPage);
      if (configuredBlogPage && configuredPath !== `/${locale}/blog`) {
        permanentRedirect(configuredPath);
      }
    }
    if (isContactPageAliasSlug(pageSlug)) {
      const configuredContactPage = await getContactPage(locale, isEnabled);
      const configuredPath = contactPagePath(locale, configuredContactPage);
      if (configuredContactPage && configuredPath !== cmsPageCanonicalPath(pageSlug, locale)) {
        permanentRedirect(configuredPath);
      }
    }
    if (isSearchPageAliasSlug(pageSlug)) {
      const configuredSearchPage = await getSearchPage(locale, isEnabled);
      const configuredPath = searchPagePath(locale, configuredSearchPage);
      if (configuredSearchPage && configuredPath !== cmsPageCanonicalPath(pageSlug, locale)) {
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

  const configuredSearchPage = await getSearchPage(locale, isEnabled);
  if (configuredSearchPage?.id === page.id) {
    const canonical = cmsPageCanonicalPath(page.slug, locale);
    const requested = cmsPageCanonicalPath(pageSlug, locale);
    if (canonical !== requested) {
      permanentRedirect(searchResultsPath(canonical, readSearchQuery((await searchParams).q)));
    }
  }

  const latestPostsCatalog = contentNeedsLatestPostsCatalog(page.contentPage)
    ? loadLatestPostsCatalog(toDatoSiteLocale(locale), isEnabled)
    : undefined;

  const configuredContactPage = await getContactPage(locale, isEnabled);
  const query = contentNeedsSearchResults(page.contentPage)
    ? readSearchQuery((await searchParams).q)
    : "";
  const searchResults = query ? searchSite(query, locale) : undefined;

  return (
    <CmsPageArticle
      page={page}
      locale={locale}
      canonicalPath={cmsPageCanonicalPath(pageSlug, locale)}
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
