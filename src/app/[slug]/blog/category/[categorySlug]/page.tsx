import { PostCard } from "@/components/patterns/post-card";
import { BreadcrumbNav } from "@/components/patterns/breadcrumb-nav";
import { JsonLdScript } from "@/components/patterns/seo-manager";
import { StructuredTextRenderer } from "@/components/patterns/structured-text-renderer";
import type { AppLocale } from "@/constants/i18n";
import { isAppLocale, toDatoSiteLocale } from "@/constants/i18n";
import { getCategoryBySlug, getPostsByCategory } from "@/infra/datocms/get-blog";
import { getStaticParamsCategories } from "@/infra/datocms/static-params";
import { buildDatoPageMetadata } from "@/lib/seo/build-dato-page-metadata";
import { buildListingPageJsonLd } from "@/lib/seo/build-listing-page-jsonld";
import {
  blogBreadcrumbLabel,
  crumbsToNavItems,
  homeBreadcrumbLabel,
} from "@/lib/seo/breadcrumb-labels";
import { buildLocaleAlternatePaths } from "@/lib/seo/hreflang";
import type { CdaStructuredTextValue } from "datocms-structured-text-utils";
import { draftMode } from "next/headers";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

type CategoryPageProps = {
  params: Promise<{ slug: string; categorySlug: string }>;
};

export async function generateStaticParams() {
  return getStaticParamsCategories();
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug, categorySlug } = await params;
  if (!isAppLocale(slug)) {
    return { title: "Categoria" };
  }
  const locale = slug as AppLocale;
  const { isEnabled } = await draftMode();
  const result = await getCategoryBySlug(toDatoSiteLocale(locale), categorySlug, isEnabled);

  if ("errors" in result || !result.data.category) {
    return { title: "Categoria" };
  }

  const { category, _site } = result.data;
  return buildDatoPageMetadata({
    path: `/${locale}/blog/category/${categorySlug}`,
    seoMetaTags: category._seoMetaTags,
    faviconMetaTags: _site.faviconMetaTags,
    seoSettingsSocial: category.seoSettingsSocial,
    hreflangPaths: buildLocaleAlternatePaths((l) => `/${l}/blog/category/${categorySlug}`),
  });
}

export default async function CategoryPostsPage({ params }: CategoryPageProps) {
  const { slug, categorySlug } = await params;
  if (!isAppLocale(slug)) {
    notFound();
  }
  const locale = slug as AppLocale;
  const { isEnabled } = await draftMode();
  const categoryResult = await getCategoryBySlug(toDatoSiteLocale(locale), categorySlug, isEnabled);

  if ("errors" in categoryResult) {
    notFound();
  }

  const category = categoryResult.data.category;
  if (!category) {
    notFound();
  }

  const postsResult = await getPostsByCategory(toDatoSiteLocale(locale), category.id, isEnabled);
  if ("errors" in postsResult) {
    notFound();
  }

  const posts = postsResult.data.allPosts;
  const desc = category.categoryDescription;
  const descData: CdaStructuredTextValue | null =
    desc && desc.value
      ? {
          value: desc.value,
          blocks: desc.blocks as CdaStructuredTextValue["blocks"],
          links: desc.links as CdaStructuredTextValue["links"],
          inlineBlocks: desc.inlineBlocks,
        }
      : null;

  const icon = category.categoryIcon;
  const colorHex = category.categoryColor?.hex;
  const categoryPath = `/${locale}/blog/category/${categorySlug}`;
  const jsonLd = buildListingPageJsonLd(locale, categoryPath, category.categoryName, [
    { name: blogBreadcrumbLabel(), path: `/${locale}/blog` },
  ]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12">
      <JsonLdScript graph={jsonLd} />
      <BreadcrumbNav
        locale={locale}
        items={crumbsToNavItems([
          { name: homeBreadcrumbLabel(locale), path: `/${locale}` },
          { name: blogBreadcrumbLabel(), path: `/${locale}/blog` },
          { name: category.categoryName, path: categoryPath },
        ])}
      />

      <header className="mt-6 space-y-4 border-b border-border pb-8">
        <div className="flex flex-wrap items-center gap-3">
          {icon?.url ? (
            <Image
              src={icon.url}
              alt={icon.alt ?? ""}
              width={icon.width ?? 48}
              height={icon.height ?? 48}
              className="size-12 rounded-lg border border-border bg-muted object-cover"
            />
          ) : null}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {colorHex ? (
                <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden className="shrink-0">
                  <circle cx="5" cy="5" r="5" fill={colorHex} />
                </svg>
              ) : null}
              <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground">{category.categoryName}</h1>
            </div>
            {category.categorySlug ? (
              <p className="mt-1 text-sm text-muted-foreground">
                <span className="font-mono text-xs">/{category.categorySlug}</span>
              </p>
            ) : null}
          </div>
        </div>
        {descData ? (
          <div className="max-w-3xl">
            <StructuredTextRenderer data={descData} contentLinkGroup={isEnabled} locale={locale} />
          </div>
        ) : null}
      </header>

      <section className="mt-10" aria-labelledby="categoria-artigos">
        <h2 id="categoria-artigos" className="text-xl font-semibold tracking-tight text-foreground">
          Artigos nesta categoria
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} locale={locale} />
          ))}
        </div>
      </section>
    </div>
  );
}
