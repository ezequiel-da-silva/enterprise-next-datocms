import { PostCard } from "@/components/patterns/post-card";
import type { AppLocale } from "@/constants/i18n";
import { APP_LOCALES, isAppLocale, toDatoSiteLocale } from "@/constants/i18n";
import { getAllPosts } from "@/infra/datocms/get-blog";
import { buildDatoPageMetadata } from "@/lib/seo/build-dato-page-metadata";
import { draftMode } from "next/headers";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type BlogIndexProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return APP_LOCALES.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BlogIndexProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isAppLocale(slug)) {
    return { title: "Blog" };
  }
  const locale = slug;
  const { isEnabled } = await draftMode();
  const result = await getAllPosts(toDatoSiteLocale(locale), isEnabled);

  if ("errors" in result) {
    return { title: "Blog" };
  }

  const meta = buildDatoPageMetadata({
    path: `/${locale}/blog`,
    seoMetaTags: [],
    faviconMetaTags: result.data._site.faviconMetaTags,
  });
  return { ...meta, title: "Blog" };
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

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12">
      <header className="mb-10 space-y-2">
        <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground">Blog</h1>
        <p className="max-w-2xl text-muted-foreground">Artigos, autores e categorias — conteúdo servido pelo DatoCMS com i18n.</p>
      </header>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} locale={locale} />
        ))}
      </div>
    </div>
  );
}
