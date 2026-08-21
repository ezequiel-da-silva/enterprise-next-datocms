import { CmsPageArticle } from "@/components/patterns/cms-page-article";
import { submitUserReview } from "@/app/actions/submit-user-review";
import {
  APP_LOCALES,
  DEFAULT_APP_LOCALE,
  REQUEST_LOCALE_HEADER,
  appLocaleFromParam,
  isAppLocale,
  type AppLocale,
} from "@/constants/i18n";
import { getPageBySlug } from "@/infra/datocms/get-page";
import { buildDatoPageMetadata } from "@/lib/seo/build-dato-page-metadata";
import { buildUnavailableMetadata } from "@/lib/seo/build-unavailable-metadata";
import { cmsPageCanonicalPath } from "@/lib/datocms/cms-page-path";
import { buildHreflangPathsFromSlugLocales } from "@/lib/seo/hreflang";
import { getStaticParamsPages } from "@/infra/datocms/static-params";
import { draftMode, headers } from "next/headers";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const pages = await getStaticParamsPages();
  const localeRoots = APP_LOCALES.map((locale) => ({ slug: locale }));
  return [...localeRoots, ...pages];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { isEnabled } = await draftMode();
  const headerStore = await headers();
  const headerLocale = appLocaleFromParam(headerStore.get(REQUEST_LOCALE_HEADER) ?? "") ?? DEFAULT_APP_LOCALE;

  const cmsLocale: AppLocale = isAppLocale(slug) ? slug : headerLocale;
  const pageSlug = isAppLocale(slug) ? "home" : slug;

  const result = await getPageBySlug(pageSlug, isEnabled, cmsLocale);

  if ("errors" in result || !result.data.page) {
    return buildUnavailableMetadata("Página");
  }

  const { page, _site } = result.data;
  return buildDatoPageMetadata({
    path: cmsPageCanonicalPath(pageSlug, cmsLocale),
    seoMetaTags: page._seoMetaTags,
    faviconMetaTags: _site.faviconMetaTags,
    seoSettingsSocial: page.seoSettingsSocial,
    fallbackTitle: page.title,
    hreflangPaths: buildHreflangPathsFromSlugLocales(page.slugLocales, (l, s) =>
      cmsPageCanonicalPath(s, l),
    ),
  });
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;
  const { isEnabled } = await draftMode();
  const headerStore = await headers();
  const headerLocale = appLocaleFromParam(headerStore.get(REQUEST_LOCALE_HEADER) ?? "") ?? DEFAULT_APP_LOCALE;

  const cmsLocale: AppLocale = isAppLocale(slug) ? slug : headerLocale;
  const pageSlug = isAppLocale(slug) ? "home" : slug;

  const result = await getPageBySlug(pageSlug, isEnabled, cmsLocale);

  if ("errors" in result) {
    notFound();
  }

  const page = result.data.page;
  if (!page) {
    notFound();
  }

  return (
    <CmsPageArticle
      page={page}
      locale={cmsLocale}
      canonicalPath={cmsPageCanonicalPath(pageSlug, cmsLocale)}
      contentLinkGroup={isEnabled}
      submitUserReview={submitUserReview}
    />
  );
}
