import { AuthorSection } from "@/components/patterns/author-section";
import { BreadcrumbNav } from "@/components/patterns/breadcrumb-nav";
import { JsonLdScript } from "@/components/patterns/seo-manager";
import { StructuredTextRenderer } from "@/components/patterns/structured-text-renderer";
import type { AppLocale } from "@/constants/i18n";
import { isAppLocale, toDatoSiteLocale } from "@/constants/i18n";
import { DatoResponsivePicture } from "@/components/patterns/dato-responsive-picture";
import { getPostBySlug } from "@/infra/datocms/get-blog";
import { getSiteSeo, pickSiteSeo } from "@/infra/datocms/get-site-seo";
import { getStaticParamsBlogPosts } from "@/infra/datocms/static-params";
import { buildBlogPostJsonLdGraph } from "@/lib/seo/build-blog-post-jsonld";
import { buildDatoPageMetadata, cmsContentOgImage } from "@/lib/seo/build-dato-page-metadata";
import { buildUnavailableMetadata } from "@/lib/seo/build-unavailable-metadata";
import {
  blogBreadcrumbLabel,
  crumbsToNavItems,
  homeBreadcrumbLabel,
} from "@/lib/seo/breadcrumb-labels";
import { buildHreflangPathsFromSlugLocales } from "@/lib/seo/hreflang";
import { buildSiteIdentity } from "@/lib/seo/site-identity";
import { formatPublishedAt } from "@/lib/blog/format-published-at";
import { excerptPlainText, readPostExcerpt } from "@/lib/blog/excerpt";
import type { CdaStructuredTextValue } from "datocms-structured-text-utils";
import { draftMode } from "next/headers";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type BlogPostPageProps = {
  params: Promise<{ slug: string; postSlug: string }>;
};

export async function generateStaticParams() {
  return getStaticParamsBlogPosts();
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug, postSlug } = await params;
  if (!isAppLocale(slug)) {
    return buildUnavailableMetadata("Artigo");
  }
  const locale = slug as AppLocale;
  const { isEnabled } = await draftMode();
  const [result, seoResult] = await Promise.all([
    getPostBySlug(toDatoSiteLocale(locale), postSlug, isEnabled),
    getSiteSeo(locale, isEnabled),
  ]);

  if ("errors" in result || !result.data.post) {
    return buildUnavailableMetadata("Artigo");
  }

  const { post, _site } = result.data;
  const siteOg = buildSiteIdentity({ seo: pickSiteSeo(seoResult) }).fallbackOgImage;
  return buildDatoPageMetadata({
    path: `/${locale}/blog/${postSlug}`,
    seoMetaTags: post._seoMetaTags,
    faviconMetaTags: _site.faviconMetaTags,
    seoSettingsSocial: post.seoSettingsSocial,
    fallbackTitle: post.postTitle,
    fallbackOgImage: cmsContentOgImage({ cover: post.coverImage }) ?? siteOg,
    hreflangPaths: buildHreflangPathsFromSlugLocales(post.slugLocales, (l, s) => `/${l}/blog/${s}`),
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug, postSlug } = await params;
  if (!isAppLocale(slug)) {
    notFound();
  }
  const locale = slug as AppLocale;
  const { isEnabled } = await draftMode();
  const result = await getPostBySlug(toDatoSiteLocale(locale), postSlug, isEnabled);

  if ("errors" in result) {
    notFound();
  }

  const post = result.data.post;
  if (!post) {
    notFound();
  }

  const structured = post.postContent
    ? ({
        value: post.postContent.value,
        blocks: post.postContent.blocks ?? [],
        links: post.postContent.links ?? [],
        inlineBlocks: post.postContent.inlineBlocks ?? [],
      } satisfies CdaStructuredTextValue)
    : null;

  const coverMobile = post.coverImage?.asset;
  const coverDesktop = post.coverImage?.assetDesktop;
  const dateLabel = formatPublishedAt(locale, post._firstPublishedAt);
  const excerpt = readPostExcerpt(post as Record<string, unknown>);
  const excerptLead = excerptPlainText(excerpt);

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12">
      <JsonLdScript graph={buildBlogPostJsonLdGraph(locale, postSlug, post)} />
      <header className="space-y-4">
        <BreadcrumbNav
          locale={locale}
          items={crumbsToNavItems([
            { name: homeBreadcrumbLabel(locale), path: `/${locale}` },
            { name: blogBreadcrumbLabel(), path: `/${locale}/blog` },
            { name: post.postTitle, path: `/${locale}/blog/${postSlug}` },
          ])}
        />
        <p className="text-sm text-muted-foreground">
          <time dateTime={post._firstPublishedAt}>{dateLabel}</time>
        </p>
        <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground">{post.postTitle}</h1>
        {excerptLead ? <p className="text-lg leading-relaxed text-muted-foreground">{excerpt}</p> : null}
        {post.postCategory?.length ? (
          <div className="flex flex-wrap gap-2">
            {post.postCategory.map((c) => {
              const chip = (
                <>
                  {c.categoryColor?.hex ? (
                    <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden className="shrink-0">
                      <circle cx="4" cy="4" r="4" fill={c.categoryColor.hex} />
                    </svg>
                  ) : null}
                  {c.categoryName}
                </>
              );
              return c.categorySlug ? (
                <Link
                  key={c.id}
                  href={`/${locale}/blog/category/${c.categorySlug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium text-foreground hover:border-primary/30"
                >
                  {chip}
                </Link>
              ) : (
                <span key={c.id} className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  {chip}
                </span>
              );
            })}
          </div>
        ) : null}
      </header>

      {coverMobile?.url ? (
        <figure className="mt-8 overflow-hidden rounded-xl border border-border bg-muted shadow-sm ring-1 ring-border/40">
          <DatoResponsivePicture
            mobile={coverMobile}
            desktop={coverDesktop}
            className="h-auto w-full object-cover"
            sizes="(max-width: 768px) 100vw, 720px"
            fallbackAlt={post.postTitle}
          />
        </figure>
      ) : null}

      <div className="mt-10">
        <StructuredTextRenderer data={structured} contentLinkGroup={isEnabled} locale={locale} />
      </div>

      {post.postAuthor ? <AuthorSection author={post.postAuthor} locale={locale} contentLinkGroup={isEnabled} /> : null}
    </article>
  );
}
