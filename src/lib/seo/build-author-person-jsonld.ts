import type { AppLocale } from "@/constants/i18n";
import type { AuthorDetailRecord } from "@/infra/datocms/types-blog";
import { dastPlainText } from "@/lib/datocms/dast-plain-text";
import { isSafeExternalHref } from "@/lib/datocms/link-block";
import { getSiteBaseUrl } from "@/lib/seo/site-config";

export function buildAuthorPersonJsonLd(
  locale: AppLocale,
  authorSlug: string,
  author: AuthorDetailRecord,
): Record<string, unknown> {
  const base = getSiteBaseUrl();
  const url = `${base}/${locale}/blog/author/${authorSlug}`;
  const image =
    author.avatarBio?.asset?.url ?? author.avatarBio?.assetDesktop?.url ?? undefined;
  const description = author.authorBio ? dastPlainText(author.authorBio) || undefined : undefined;
  const sameAs = author.authorSocialLinks
    .map((link) => link.url?.trim() ?? "")
    .filter((href) => href && isSafeExternalHref(href));
  const jobTitle = author.authorRole?.trim() || undefined;

  return {
    "@type": "Person",
    "@id": `${url}#person`,
    name: author.authorName,
    url,
    ...(image ? { image } : {}),
    ...(description ? { description } : {}),
    ...(jobTitle ? { jobTitle } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}
