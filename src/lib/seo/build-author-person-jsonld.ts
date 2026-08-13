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
  const socialUrl = author.authorSocialLinks?.url?.trim();
  const sameAs =
    socialUrl && isSafeExternalHref(socialUrl) ? [socialUrl] : undefined;

  return {
    "@type": "Person",
    "@id": `${url}#person`,
    name: author.authorName,
    url,
    ...(image ? { image } : {}),
    ...(description ? { description } : {}),
    ...(sameAs ? { sameAs } : {}),
  };
}
