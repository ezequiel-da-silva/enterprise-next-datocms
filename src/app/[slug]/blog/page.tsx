import { PostCard } from "@/components/patterns/post-card";
import { BreadcrumbNav } from "@/components/patterns/breadcrumb-nav";
import { JsonLdScript } from "@/components/patterns/seo-manager";
import type { AppLocale } from "@/constants/i18n";
import { APP_LOCALES, isAppLocale, toDatoSiteLocale } from "@/constants/i18n";
import { getAllPosts } from "@/infra/datocms/get-blog";
import { getSiteSeo, pickSiteSeo } from "@/infra/datocms/get-site-seo";
import { buildDatoPageMetadata } from "@/lib/seo/build-dato-page-metadata";
import { buildUnavailableMetadata } from "@/lib/seo/build-unavailable-metadata";
import { buildListingPageJsonLd } from "@/lib/seo/build-listing-page-jsonld";
import { blogBreadcrumbLabel, crumbsToNavItems, homeBreadcrumbLabel } from "@/lib/seo/breadcrumb-labels";
import { buildLocaleAlternatePaths } from "@/lib/seo/hreflang";
import { openGraphLocale } from "@/lib/seo/locale-tags";
import { buildMetadata } from "@/lib/seo";
import { buildSiteIdentity } from "@/lib/seo/site-identity";
import { draftMode } from "next/headers";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

const BLOG_INDEX_DESCRIPTION: Record<AppLocale, string> = {
  en: "Articles, guides and updates from the team.",
  pt: "Artigos, guias e novidades da equipa.",
  es: "Artículos, guías y novedades del equipo.",
};

type BlogIndexProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return APP_LOCALES.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BlogIndexProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isAppLocale(slug)) {
    return buildUnavailableMetadata("Blog");
  }
  const locale = slug;
  const { isEnabled } = await draftMode();
  const [result, seoResult] = await Promise.all([
    getAllPosts(toDatoSiteLocale(locale), isEnabled),
    getSiteSeo(locale, isEnabled),
  ]);

  if ("errors" in result) {
    return buildUnavailableMetadata("Blog");
  }

  const path = `/${locale}/blog`;
  const hreflangPaths = buildLocaleAlternatePaths((l) => `/${l}/blog`);
  const description = BLOG_INDEX_DESCRIPTION[locale];
  const siteOg = buildSiteIdentity({ seo: pickSiteSeo(seoResult) }).fallbackOgImage;
  const fromDato = buildDatoPageMetadata({
    path,
    seoMetaTags: [],
    faviconMetaTags: result.data._site.faviconMetaTags,
    fallbackTitle: "Blog",
    fallbackOgImage: siteOg,
    hreflangPaths,
  });
  const base = buildMetadata({
    title: "Blog",
    description,
    path,
    locale,
    hreflangPaths,
    openGraphImage: siteOg,
  });
  return {
    ...fromDato,
    ...base,
    icons: fromDato.icons,
    openGraph: {
      ...fromDato.openGraph,
      ...base.openGraph,
      locale: openGraphLocale(locale),
    },
  };
}

export default async function BlogIndexPage({ params }: BlogIndexProps) {
  const { slug } = await params;
  if (!isAppLocale(slug)) {
    notFound();
  }
  const locale = slug as AppLocale;
  const { isEnabled } = await draftMode();
  const result = await getAllPosts(toDatoSiteLocale(locale), isEnabled);

  if ("errors" in result) {
    notFound();
  }

  const posts = result.data.allPosts;
  const blogPath = `/${locale}/blog`;
  const jsonLd = buildListingPageJsonLd(
    locale,
    blogPath,
    blogBreadcrumbLabel(),
    undefined,
    posts.map((post) => ({
      name: post.postTitle,
      path: `/${locale}/blog/${post.postSlug}`,
    })),
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12">
      <JsonLdScript graph={jsonLd} />
      <header className="mb-10 space-y-2">
        <BreadcrumbNav
          locale={locale}
          items={crumbsToNavItems([
            { name: homeBreadcrumbLabel(locale), path: `/${locale}` },
            { name: blogBreadcrumbLabel(), path: blogPath },
          ])}
        />
        <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground">Blog</h1>
        <p className="max-w-2xl text-muted-foreground">{BLOG_INDEX_DESCRIPTION[locale]}</p>
      </header>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} locale={locale} />
        ))}
      </div>
    </div>
  );
}
