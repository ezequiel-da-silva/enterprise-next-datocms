import { ProductPageArticle } from "@/components/patterns/product-page-article";
import type { AppLocale } from "@/constants/i18n";
import { isAppLocale } from "@/constants/i18n";
import { getProductPageByHandle } from "@/infra/datocms/get-product-page";
import { getProductsIndexPage, productsIndexLabel, productsIndexPath } from "@/infra/datocms/get-products-index-page";
import { productPagePath } from "@/lib/datocms/product-page-path";
import { getStaticParamsProductPages } from "@/infra/datocms/static-params";
import { getStorefrontProductByHandle } from "@/infra/shopify/storefront";
import { getSiteSeo, pickSiteSeo } from "@/infra/datocms/get-site-seo";
import { buildDatoPageMetadata } from "@/lib/seo/build-dato-page-metadata";
import { buildUnavailableMetadata } from "@/lib/seo/build-unavailable-metadata";
import { buildLocaleAlternatePaths } from "@/lib/seo/hreflang";
import { buildSiteIdentity } from "@/lib/seo/site-identity";
import { draftMode } from "next/headers";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type ProductPdpProps = {
  params: Promise<{ slug: string; handle: string }>;
};

export async function generateStaticParams() {
  return getStaticParamsProductPages();
}

export async function generateMetadata({ params }: ProductPdpProps): Promise<Metadata> {
  const { slug, handle } = await params;
  if (!isAppLocale(slug) || !handle.trim()) {
    return buildUnavailableMetadata("Product");
  }
  const locale = slug as AppLocale;
  const { isEnabled } = await draftMode();
  const [result, seoResult, storefront] = await Promise.all([
    getProductPageByHandle(locale, handle, isEnabled),
    getSiteSeo(locale, isEnabled),
    getStorefrontProductByHandle(handle),
  ]);
  if ("errors" in result || !result.data.productPage) {
    return buildUnavailableMetadata("Product");
  }
  const page = result.data.productPage;
  const siteOg = buildSiteIdentity({ seo: pickSiteSeo(seoResult) }).fallbackOgImage;
  return buildDatoPageMetadata({
    path: productPagePath(locale, handle),
    seoMetaTags: page._seoMetaTags,
    faviconMetaTags: result.data._site.faviconMetaTags,
    seoSettingsSocial: page.seo,
    fallbackTitle: page.title,
    fallbackOgImage: page.seo?.image?.url ?? storefront?.featuredImage?.url ?? siteOg,
    hreflangPaths: buildLocaleAlternatePaths((l) => productPagePath(l, handle)),
  });
}

export default async function ProductPdpPage({ params }: ProductPdpProps) {
  const { slug, handle } = await params;
  if (!isAppLocale(slug) || !handle.trim()) {
    notFound();
  }
  const locale = slug as AppLocale;
  const { isEnabled } = await draftMode();
  const [result, catalog, storefront] = await Promise.all([
    getProductPageByHandle(locale, handle, isEnabled),
    getProductsIndexPage(locale, isEnabled),
    getStorefrontProductByHandle(handle),
  ]);

  if ("errors" in result || !result.data.productPage) {
    notFound();
  }

  const page = result.data.productPage;
  return (
    <ProductPageArticle
      locale={locale}
      handle={page.shopifyHandle?.trim() || handle}
      title={page.title?.trim() || handle}
      description={page.description?.trim() || null}
      catalogPath={productsIndexPath(locale, catalog)}
      catalogLabel={productsIndexLabel(catalog)}
      storefront={storefront}
    />
  );
}
