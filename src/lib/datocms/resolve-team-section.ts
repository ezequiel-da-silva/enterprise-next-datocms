/**
 * Team Section (`team_section`) — members are links to Author.
 *
 * CMS: `title`, `subtitle` (optional strings); `members` (1+ Author records).
 * Author card fields: `authorName`, `authorSlug`, `authorRole`, `avatarBio`, `authorSocialLinks`.
 * `authorSocialLinks` is modular (array) in the current schema; older CDA may still
 * return a single Social Link object.
 */
import type { FileFieldLike } from "@/infra/datocms/types-page";
import type { SocialLinkNav } from "@/infra/datocms/types-navigation";
import {
  readCdaArray,
  readCdaBlock,
  readCdaString,
  readCdaStringForLogic,
} from "@/lib/datocms/cda-field";
import { isSafeExternalHref } from "@/lib/datocms/link-block";

export type TeamMemberAvatar = {
  id?: string;
  __typename?: string;
  asset?: FileFieldLike;
  assetDesktop?: FileFieldLike;
};

export type TeamMemberSocial = {
  id: string;
  plataforma: string | null;
  url: string | null;
  linkAria?: string | null;
  openInNewTab?: boolean | null;
  image?: FileFieldLike;
};

export type TeamMember = {
  id: string;
  authorName: string;
  authorSlug: string;
  authorRole: string;
  avatar: TeamMemberAvatar | null;
  socialLinks: TeamMemberSocial[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function readSocialItem(raw: Record<string, unknown>): TeamMemberSocial | null {
  const id = typeof raw.id === "string" ? raw.id.trim() : "";
  if (!id) return null;
  const image = readCdaObjectOrNull(raw);
  return {
    id,
    plataforma: readCdaStringForLogic(raw, "plataforma", "plataforma") || null,
    url: readCdaString(raw, "url", "url") || null,
    linkAria: readCdaStringForLogic(raw, "linkAria", "link_aria") || null,
    openInNewTab: raw.openInNewTab === false || raw.open_in_new_tab === false ? false : true,
    image,
  };
}

function readCdaObjectOrNull(raw: Record<string, unknown>): FileFieldLike {
  const image = raw.image;
  if (!isRecord(image) || typeof image.url !== "string" || !image.url.trim()) return null;
  return {
    url: image.url,
    alt: typeof image.alt === "string" ? image.alt : null,
    width: typeof image.width === "number" ? image.width : null,
    height: typeof image.height === "number" ? image.height : null,
  };
}

/** Social links as 0–n items (array or legacy single block). */
export function readAuthorSocialLinks(record: Record<string, unknown>): TeamMemberSocial[] {
  const fromArray = readCdaArray<Record<string, unknown>>(
    record,
    "authorSocialLinks",
    "author_social_links",
  );
  const items =
    fromArray.length > 0
      ? fromArray.filter(isRecord)
      : (() => {
          const one = readCdaBlock<Record<string, unknown>>(
            record,
            "authorSocialLinks",
            "author_social_links",
          );
          return one ? [one] : [];
        })();

  const parsed: TeamMemberSocial[] = [];
  for (const item of items) {
    const social = readSocialItem(item);
    if (social?.url && isSafeExternalHref(social.url)) parsed.push(social);
  }
  return parsed;
}

export function toSocialNavLink(link: TeamMemberSocial): SocialLinkNav {
  return {
    id: link.id,
    plataforma: link.plataforma,
    url: link.url,
    linkAria: link.linkAria ?? null,
    openInNewTab: link.openInNewTab ?? true,
    image: link.image ?? null,
  };
}

export function resolveTeamMembers(record: Record<string, unknown>): TeamMember[] {
  const members = readCdaArray<Record<string, unknown>>(record, "members", "members");
  const result: TeamMember[] = [];

  for (const member of members) {
    if (!isRecord(member)) continue;
    const typename = typeof member.__typename === "string" ? member.__typename : "";
    if (typename && typename !== "AuthorRecord") continue;
    const id = typeof member.id === "string" ? member.id.trim() : "";
    const authorName = readCdaString(member, "authorName", "author_name");
    if (!id || !authorName) continue;

    result.push({
      id,
      authorName,
      authorSlug: readCdaString(member, "authorSlug", "author_slug"),
      authorRole: readCdaString(member, "authorRole", "author_role"),
      avatar: readCdaBlock<TeamMemberAvatar>(member, "avatarBio", "avatar_bio"),
      socialLinks: readAuthorSocialLinks(member),
    });
  }

  return result;
}
