import { CmsPageArticle } from "@/components/patterns/cms-page-article";
import { submitUserReview } from "@/app/actions/submit-user-review";
import { isAppLocale, toDatoSiteLocale, type AppLocale } from "@/constants/i18n";
import { contentNeedsLatestPostsCatalog, loadLatestPostsCatalog } from "@/infra/datocms/get-blog";
import { getPageBySlug } from "@/infra/datocms/get-page";
import { getSiteSeo, pickSiteSeo } from "@/infra/datocms/get-site-seo";
import { buildDatoPageMetadata, cmsContentOgImage } from "@/lib/seo/build-dato-page-metadata";
import { buildUnavailableMetadata } from "@/lib/seo/build-unavailable-metadata";
import { cmsPageCanonicalPath } from "@/lib/datocms/cms-page-path";
import { buildHreflangPathsFromSlugLocales } from "@/lib/seo/hreflang";
import { buildSiteIdentity } from "@/lib/seo/site-identity";
import { getStaticParamsLocaleCmsPages } from "@/infra/datocms/static-params";
import { draftMode } from "next/headers";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string; pageSlug: string }>;
};

export async function generateStaticParams() {
  return getStaticParamsLocaleCmsPages();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
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
  return buildDatoPageMetadata({
    path: cmsPageCanonicalPath(pageSlug, locale),
    seoMetaTags: page._seoMetaTags,
    faviconMetaTags: _site.faviconMetaTags,
    seoSettingsSocial: page.seoSettingsSocial,
    fallbackTitle: page.title,
    fallbackOgImage: cmsContentOgImage({ hero: page.heroPage }) ?? siteOg,
    hreflangPaths: buildHreflangPathsFromSlugLocales(page.slugLocales, (l, s) =>
      cmsPageCanonicalPath(s, l),
    ),
  });
}

export default async function LocalePrefixedCmsPage({ params }: PageProps) {
  const { slug, pageSlug } = await params;
  if (!isAppLocale(slug)) {
    notFound();
  }
  const locale = slug as AppLocale;
  const { isEnabled } = await draftMode();
  const result = await getPageBySlug(pageSlug, isEnabled, locale);

  if ("errors" in result) {
    notFound();
  }

  const page = result.data.page;
  if (!page) {
    notFound();
  }

  const latestPostsCatalog = contentNeedsLatestPostsCatalog(page.contentPage)
    ? await loadLatestPostsCatalog(toDatoSiteLocale(locale), isEnabled)
    : undefined;

  return (
    <CmsPageArticle
      page={page}
      locale={locale}
      canonicalPath={cmsPageCanonicalPath(pageSlug, locale)}
      contentLinkGroup={isEnabled}
      submitUserReview={submitUserReview}
      latestPostsCatalog={latestPostsCatalog}
    />
  );
}
