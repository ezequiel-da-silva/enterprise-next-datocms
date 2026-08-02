import type { AppLocale } from "@/constants/i18n";
import type { PostDetailRecord } from "@/infra/datocms/types-blog";
import { getOrganizationName, getSiteBaseUrl } from "@/lib/seo/site-config";

function schemaLanguage(locale: AppLocale): string {
  if (locale === "en") return "en";
  if (locale === "pt") return "pt-BR";
  return "es";
}

/**
 * JSON-LD para artigos do blog: `BlogPosting` + `BreadcrumbList` (Schema.org).
 * Complementa metadados Open Graph já gerados por `buildDatoPageMetadata`.
 */
export function buildBlogPostJsonLdGraph(
  locale: AppLocale,
  postSlug: string,
  post: PostDetailRecord,
): Record<string, unknown>[] {
  const base = getSiteBaseUrl();
  const path = `/${locale}/blog/${postSlug}`;
  const url = `${base}${path}`;
  const blogIndexUrl = `${base}/${locale}/blog`;
  const localeRootUrl = `${base}/${locale}`;

  const imageUrl = post.coverImage?.asset?.url ?? post.coverImage?.assetDesktop?.url ?? undefined;
  const description = post.seoSettingsSocial?.description?.trim() || undefined;
  const primaryCategory = post.postCategory[0]?.categoryName;

  const author = post.postAuthor
    ? {
        "@type": "Person" as const,
        name: post.postAuthor.authorName,
        url: `${base}/${locale}/blog/author/${post.postAuthor.authorSlug}`,
      }
    : undefined;

  const publisherName = getOrganizationName();

  const blogPosting: Record<string, unknown> = {
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.postTitle,
    datePublished: post._firstPublishedAt,
    inLanguage: schemaLanguage(locale),
    isPartOf: { "@id": `${base}/#website` },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
    },
    ...(description ? { description } : {}),
    ...(imageUrl ? { image: [imageUrl] } : {}),
    ...(author ? { author } : {}),
    ...(primaryCategory ? { articleSection: primaryCategory } : {}),
    publisher: {
      "@type": "Organization",
      name: publisherName,
      url: base,
    },
  };

  const breadcrumb: Record<string, unknown> = {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: localeRootUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: blogIndexUrl,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.postTitle,
        item: url,
      },
    ],
  };

  return [blogPosting, breadcrumb];
}
