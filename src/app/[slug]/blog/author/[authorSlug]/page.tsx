import { PostCard } from "@/components/patterns/post-card";
import { BreadcrumbNav } from "@/components/patterns/breadcrumb-nav";
import { JsonLdScript } from "@/components/patterns/seo-manager";
import { StructuredTextRenderer } from "@/components/patterns/structured-text-renderer";
import type { AppLocale } from "@/constants/i18n";
import { isAppLocale, toDatoSiteLocale } from "@/constants/i18n";
import { DatoResponsivePicture } from "@/components/patterns/dato-responsive-picture";
import { getAuthorBySlug, getPostsByAuthor } from "@/infra/datocms/get-blog";
import { getSiteSeo, pickSiteSeo } from "@/infra/datocms/get-site-seo";
import { getStaticParamsAuthors } from "@/infra/datocms/static-params";
import { isSafeExternalHref } from "@/lib/datocms/link-block";
import { buildDatoPageMetadata } from "@/lib/seo/build-dato-page-metadata";
import { buildUnavailableMetadata } from "@/lib/seo/build-unavailable-metadata";
import { buildListingPageJsonLd } from "@/lib/seo/build-listing-page-jsonld";
import { buildAuthorPersonJsonLd } from "@/lib/seo/build-author-person-jsonld";
import {
  blogBreadcrumbLabel,
  crumbsToNavItems,
  homeBreadcrumbLabel,
} from "@/lib/seo/breadcrumb-labels";
import { buildHreflangPathsFromSlugLocales } from "@/lib/seo/hreflang";
import { buildSiteIdentity } from "@/lib/seo/site-identity";
import type { CdaStructuredTextValue } from "datocms-structured-text-utils";
import { draftMode } from "next/headers";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type AuthorPageProps = {
  params: Promise<{ slug: string; authorSlug: string }>;
};

export async function generateStaticParams() {
  return getStaticParamsAuthors();
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { slug, authorSlug } = await params;
  if (!isAppLocale(slug)) {
    return buildUnavailableMetadata("Autor");
  }
  const locale = slug as AppLocale;
  const { isEnabled } = await draftMode();
  const [result, seoResult] = await Promise.all([
    getAuthorBySlug(toDatoSiteLocale(locale), authorSlug, isEnabled),
    getSiteSeo(locale, isEnabled),
  ]);

  if ("errors" in result || !result.data.author) {
    return buildUnavailableMetadata("Autor");
  }

  const { author, _site } = result.data;
  const siteOg = buildSiteIdentity({ seo: pickSiteSeo(seoResult) }).fallbackOgImage;
  return buildDatoPageMetadata({
    path: `/${locale}/blog/author/${authorSlug}`,
    seoMetaTags: author._seoMetaTags,
    faviconMetaTags: _site.faviconMetaTags,
    seoSettingsSocial: author.seoSettingsSocial,
    fallbackTitle: author.authorName,
    fallbackOgImage: siteOg,
    hreflangPaths: buildHreflangPathsFromSlugLocales(author.slugLocales, (l, s) => `/${l}/blog/author/${s}`),
  });
}

export default async function AuthorProfilePage({ params }: AuthorPageProps) {
  const { slug, authorSlug } = await params;
  if (!isAppLocale(slug)) {
    notFound();
  }
  const locale = slug as AppLocale;
  const { isEnabled } = await draftMode();
  const authorResult = await getAuthorBySlug(toDatoSiteLocale(locale), authorSlug, isEnabled);

  if ("errors" in authorResult) {
    notFound();
  }

  const author = authorResult.data.author;
  if (!author) {
    notFound();
  }

  const postsResult = await getPostsByAuthor(toDatoSiteLocale(locale), author.id, isEnabled);
  if ("errors" in postsResult) {
    notFound();
  }

  const posts = postsResult.data.allPosts;
  const bio = author.authorBio;
  const bioData: CdaStructuredTextValue | null =
    bio && bio.value
      ? {
          value: bio.value,
          blocks: bio.blocks as CdaStructuredTextValue["blocks"],
          links: bio.links as CdaStructuredTextValue["links"],
          inlineBlocks: bio.inlineBlocks,
        }
      : null;

  const avatarMobile = author.avatarBio?.asset;
  const avatarDesktop = author.avatarBio?.assetDesktop;
  const social = author.authorSocialLinks[0];
  const socialHref = social?.url && isSafeExternalHref(social.url) ? social.url : null;
  const role = author.authorRole?.trim() ?? "";
  const authorPath = `/${locale}/blog/author/${authorSlug}`;
  const listingLd = buildListingPageJsonLd(
    locale,
    authorPath,
    author.authorName,
    [{ name: blogBreadcrumbLabel(), path: `/${locale}/blog` }],
    posts.map((post) => ({
      name: post.postTitle,
      path: `/${locale}/blog/${post.postSlug}`,
    })),
  );
  const jsonLd = [...listingLd, buildAuthorPersonJsonLd(locale, authorSlug, author)];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12">
      <JsonLdScript graph={jsonLd} />
      <BreadcrumbNav
        locale={locale}
        items={crumbsToNavItems([
          { name: homeBreadcrumbLabel(locale), path: `/${locale}` },
          { name: blogBreadcrumbLabel(), path: `/${locale}/blog` },
          { name: author.authorName, path: authorPath },
        ])}
      />

      <header className="mt-4 flex flex-col gap-6 border-b border-border pb-10 sm:flex-row sm:items-start">
        <div className="shrink-0 overflow-hidden rounded-full border border-border bg-background shadow-sm ring-2 ring-border/50">
          {avatarMobile?.url ? (
            <DatoResponsivePicture
              mobile={avatarMobile}
              desktop={avatarDesktop}
              className="size-28 object-cover sm:size-32"
              sizes="128px"
              fallbackAlt={author.authorName}
            />
          ) : (
            <div className="flex size-28 items-center justify-center text-xs text-muted-foreground sm:size-32">Sem foto</div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-4">
          <div>
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground">{author.authorName}</h1>
            {role ? <p className="mt-2 text-sm text-muted-foreground">{role}</p> : null}
            {socialHref ? (
              <p className="mt-2 text-sm">
                <a href={socialHref} className="font-medium text-primary underline-offset-4 hover:underline" rel="noopener noreferrer" target="_blank">
                {social?.plataforma?.trim() ? social.plataforma : "Perfil"}
                </a>
              </p>
            ) : null}
          </div>
          {bioData ? <StructuredTextRenderer data={bioData} contentLinkGroup={isEnabled} locale={locale} /> : null}
        </div>
      </header>

      <section className="mt-10" aria-labelledby="autor-artigos">
        <h2 id="autor-artigos" className="text-xl font-semibold tracking-tight text-foreground">
          Artigos
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
