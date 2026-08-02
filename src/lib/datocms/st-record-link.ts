import type { AppLocale } from "@/constants/i18n";
import { cmsPageCanonicalPath } from "@/lib/datocms/cms-page-path";
import { recordToWebsiteRoute } from "@/lib/datocms/record-to-website-route";

type StLinkRecord = Record<string, unknown> & { __typename?: string };

/**
 * Resolve href + rótulo para registos referenciados no Structured Text (links / inline records).
 */
export function resolveStructuredTextRecordLink(
  record: StLinkRecord,
  locale: AppLocale,
): { href: string; label: string } | null {
  const t = record.__typename;

  if (t === "PageRecord") {
    const slug = typeof record.slug === "string" ? record.slug.trim() : "";
    if (!slug) return null;
    return {
      href: cmsPageCanonicalPath(slug, locale),
      label:
        typeof record.title === "string" && record.title.trim() !== ""
          ? record.title.trim()
          : slug,
    };
  }

  if (t === "PostRecord") {
    const slug = typeof record.postSlug === "string" ? record.postSlug.trim() : "";
    if (!slug) return null;
    const href = recordToWebsiteRoute("PostRecord", slug, locale);
    if (!href) return null;
    return {
      href,
      label:
        typeof record.postTitle === "string" && record.postTitle.trim() !== ""
          ? record.postTitle.trim()
          : slug,
    };
  }

  if (t === "CategoryRecord") {
    const slug = typeof record.categorySlug === "string" ? record.categorySlug.trim() : "";
    if (!slug) return null;
    const href = recordToWebsiteRoute("CategoryRecord", slug, locale);
    if (!href) return null;
    return {
      href,
      label:
        typeof record.categoryName === "string" && record.categoryName.trim() !== ""
          ? record.categoryName.trim()
          : slug,
    };
  }

  if (t === "AuthorRecord") {
    const slug = typeof record.authorSlug === "string" ? record.authorSlug.trim() : "";
    if (!slug) return null;
    const href = recordToWebsiteRoute("AuthorRecord", slug, locale);
    if (!href) return null;
    return {
      href,
      label:
        typeof record.authorName === "string" && record.authorName.trim() !== ""
          ? record.authorName.trim()
          : slug,
    };
  }

  return null;
}
