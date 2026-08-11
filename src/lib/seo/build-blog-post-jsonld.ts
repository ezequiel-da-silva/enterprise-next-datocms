import type { AppLocale } from "@/constants/i18n";
import type { PostDetailRecord } from "@/infra/datocms/types-blog";
import {
  blogBreadcrumbLabel,
  buildLocaleBreadcrumbTrail,
  homeBreadcrumbPath,
} from "@/lib/seo/breadcrumb-labels";
import { buildBreadcrumbListJsonLd } from "@/lib/seo/build-listing-page-jsonld";
import { schemaLanguage } from "@/lib/seo/locale-tags";
import { getOrganizationName, getSiteBaseUrl } from "@/lib/seo/site-config";

export function buildBlogPostJsonLdGraph(
  locale: AppLocale,
  postSlug: string,
  post: PostDetailRecord,
): Record<string, unknown>[] {
  const base = getSiteBaseUrl();
  const path = `/${locale}/blog/${postSlug}`;
  const url = `${base}${path}`;
  const blogIndexPath = `/${locale}/blog`;

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
    dateModified: post._updatedAt || post._firstPublishedAt,
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

  const crumbs = buildLocaleBreadcrumbTrail(
    locale,
    { name: post.postTitle, path },
    [{ name: blogBreadcrumbLabel(), path: blogIndexPath }],
  );

  return [blogPosting, buildBreadcrumbListJsonLd(crumbs)];
}

export { homeBreadcrumbPath };
