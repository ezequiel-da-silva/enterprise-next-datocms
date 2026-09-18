import { CollectionPageArticle } from "@/components/patterns/collection-page-article";
import type { AppLocale } from "@/constants/i18n";
import { isAppLocale } from "@/constants/i18n";
import { getCollectionPageByHandle } from "@/infra/datocms/get-collection-page";
import {
  collectionsIndexLabel,
  collectionsIndexPath,
  getCollectionsIndexPage,
} from "@/infra/datocms/get-collections-index-page";
import { getStaticParamsCollectionPages } from "@/infra/datocms/static-params";
import { getStorefrontCollectionByHandle } from "@/infra/shopify/storefront";
import { getSiteSeo, pickSiteSeo } from "@/infra/datocms/get-site-seo";
import { collectionPagePath } from "@/lib/datocms/collection-page-path";
import { buildDatoPageMetadata } from "@/lib/seo/build-dato-page-metadata";
import { buildUnavailableMetadata } from "@/lib/seo/build-unavailable-metadata";
import { buildLocaleAlternatePaths } from "@/lib/seo/hreflang";
import { buildSiteIdentity } from "@/lib/seo/site-identity";
import { draftMode } from "next/headers";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type CollectionPlpProps = {
  params: Promise<{ slug: string; handle: string }>;
};

export async function generateStaticParams() {
  return getStaticParamsCollectionPages();
}

export async function generateMetadata({ params }: CollectionPlpProps): Promise<Metadata> {
  const { slug, handle } = await params;
  if (!isAppLocale(slug) || !handle.trim()) {
    return buildUnavailableMetadata("Collection");
  }
  const locale = slug as AppLocale;
  const { isEnabled } = await draftMode();
  const [result, seoResult, storefront] = await Promise.all([
    getCollectionPageByHandle(locale, handle, isEnabled),
    getSiteSeo(locale, isEnabled),
    getStorefrontCollectionByHandle(handle, locale),
  ]);
  if ("errors" in result || !result.data.collectionPage) {
    return buildUnavailableMetadata("Collection");
  }
  const page = result.data.collectionPage;
  const siteOg = buildSiteIdentity({ seo: pickSiteSeo(seoResult) }).fallbackOgImage;
  return buildDatoPageMetadata({
    path: collectionPagePath(locale, handle),
    seoMetaTags: page._seoMetaTags,
    faviconMetaTags: result.data._site.faviconMetaTags,
    seoSettingsSocial: page.seo,
    fallbackTitle: page.title,
    fallbackOgImage: page.seo?.image?.url ?? storefront?.image?.url ?? siteOg,
    hreflangPaths: buildLocaleAlternatePaths((l) => collectionPagePath(l, handle)),
  });
}

export default async function CollectionPlpPage({ params }: CollectionPlpProps) {
  const { slug, handle } = await params;
  if (!isAppLocale(slug) || !handle.trim()) {
    notFound();
  }
  const locale = slug as AppLocale;
  const { isEnabled } = await draftMode();
  const [result, catalog, storefront] = await Promise.all([
    getCollectionPageByHandle(locale, handle, isEnabled),
    getCollectionsIndexPage(locale, isEnabled),
    getStorefrontCollectionByHandle(handle, locale),
  ]);

  if ("errors" in result || !result.data.collectionPage) {
    notFound();
  }

  const page = result.data.collectionPage;
  return (
    <CollectionPageArticle
      locale={locale}
      handle={page.shopifyHandle?.trim() || handle}
      title={page.title?.trim() || handle}
      description={page.description?.trim() || null}
      catalogPath={collectionsIndexPath(locale, catalog)}
      catalogLabel={collectionsIndexLabel(catalog)}
      storefront={storefront}
    />
  );
}
