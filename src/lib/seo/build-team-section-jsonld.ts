import type { AppLocale } from "@/constants/i18n";
import type { TeamMember } from "@/lib/datocms/resolve-team-section";
import { isSafeExternalHref } from "@/lib/datocms/link-block";
import { getSiteBaseUrl } from "@/lib/seo/site-config";

/**
 * ItemList of Person for a Team Section. Person `@id` matches the author
 * profile graph (`{url}#person`) so entities merge when both exist.
 */
export function buildTeamSectionJsonLd(
  locale: AppLocale,
  sectionId: string,
  members: TeamMember[],
  sectionName?: string,
): Record<string, unknown> | null {
  if (members.length === 0) return null;

  const base = getSiteBaseUrl();

  return {
    "@type": "ItemList",
    "@id": `${base}/#team-${sectionId}`,
    ...(sectionName ? { name: sectionName } : {}),
    numberOfItems: members.length,
    itemListElement: members.map((member, index) => {
      const slug = member.authorSlug.trim();
      const profileUrl = slug ? `${base}/${locale}/blog/author/${slug}` : undefined;
      const image =
        member.avatar?.asset?.url ?? member.avatar?.assetDesktop?.url ?? undefined;
      const sameAs = member.socialLinks
        .map((link) => link.url?.trim() ?? "")
        .filter((href) => href && isSafeExternalHref(href));
      const jobTitle = member.authorRole.trim() || undefined;

      const person: Record<string, unknown> = {
        "@type": "Person",
        name: member.authorName,
        ...(profileUrl ? { "@id": `${profileUrl}#person`, url: profileUrl } : {}),
        ...(image ? { image } : {}),
        ...(jobTitle ? { jobTitle } : {}),
        ...(sameAs.length > 0 ? { sameAs } : {}),
      };

      return {
        "@type": "ListItem",
        position: index + 1,
        item: person,
      };
    }),
  };
}
