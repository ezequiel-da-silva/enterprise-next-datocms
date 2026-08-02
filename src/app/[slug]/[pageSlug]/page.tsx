import { CmsPageArticle } from "@/components/patterns/cms-page-article";
import { isAppLocale, type AppLocale } from "@/constants/i18n";
import { getPageBySlug } from "@/infra/datocms/get-page";
import { buildDatoPageMetadata } from "@/lib/seo/build-dato-page-metadata";
import { cmsPageCanonicalPath } from "@/lib/datocms/cms-page-path";
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
    return { title: "Página" };
  }
  const locale = slug as AppLocale;
  const { isEnabled } = await draftMode();
  const result = await getPageBySlug(pageSlug, isEnabled, locale);

  if ("errors" in result || !result.data.page) {
    return { title: "Página" };
  }

  const { page, _site } = result.data;
  return buildDatoPageMetadata({
    path: cmsPageCanonicalPath(pageSlug, locale),
    seoMetaTags: page._seoMetaTags,
    faviconMetaTags: _site.faviconMetaTags,
    seoSettingsSocial: page.seoSettingsSocial,
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

  return (
    <CmsPageArticle
      page={page}
      locale={locale}
      canonicalPath={cmsPageCanonicalPath(pageSlug, locale)}
      contentLinkGroup={isEnabled}
    />
  );
}
