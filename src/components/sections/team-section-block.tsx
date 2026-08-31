import { Container } from "@/components/atoms/container";
import { DatoResponsivePicture } from "@/components/patterns/dato-responsive-picture";
import { JsonLdScriptSync } from "@/components/patterns/seo-manager";
import { SocialNavLink } from "@/components/patterns/social-nav-link";
import type { AppLocale } from "@/constants/i18n";
import type { TeamSectionBlockRecord } from "@/infra/datocms/types-page";
import { readCdaString } from "@/lib/datocms/cda-field";
import { cmsBlockAttrs } from "@/lib/datocms/cms-block-attrs";
import { cn } from "@/lib/cn";
import { getNonce } from "@/lib/nonce";
import {
  resolveTeamMembers,
  toSocialNavLink,
  type TeamMember,
} from "@/lib/datocms/resolve-team-section";
import { buildTeamSectionJsonLd } from "@/lib/seo/build-team-section-jsonld";
import Link from "next/link";

type TeamSectionBlockProps = {
  record: TeamSectionBlockRecord;
  locale: AppLocale;
};

const FALLBACK_SECTION_LABEL: Record<AppLocale, string> = {
  en: "Team",
  pt: "Equipe",
  es: "Equipo",
};

function authorInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}

function MemberAvatar({ member }: { member: TeamMember }) {
  const mobile = member.avatar?.asset?.url ? member.avatar.asset : member.avatar?.assetDesktop;
  const desktop = member.avatar?.assetDesktop;
  if (mobile?.url) {
    return (
      <div className="aspect-square overflow-hidden rounded-2xl bg-muted [&>picture]:block [&>picture]:size-full">
        <DatoResponsivePicture
          mobile={mobile}
          desktop={desktop}
          className="size-full object-cover object-center"
          sizes="(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) 50vw, 360px"
          fallbackAlt={member.authorName}
          decorative
          decoding="async"
        />
      </div>
    );
  }
  return (
    <div
      className="flex aspect-square items-center justify-center rounded-2xl bg-muted text-2xl font-semibold tracking-wide text-muted-foreground"
      aria-hidden
    >
      {authorInitials(member.authorName) || "?"}
    </div>
  );
}

function MemberCard({ member, locale }: { member: TeamMember; locale: AppLocale }) {
  const profileHref = member.authorSlug ? `/${locale}/blog/author/${member.authorSlug}` : null;
  const nameClass = "mt-4 text-lg font-semibold tracking-tight text-foreground";
  const identity = (
    <>
      <MemberAvatar member={member} />
      <h3 className={profileHref ? cn(nameClass, "underline-offset-4 group-hover:underline group-focus-visible:underline") : nameClass}>
        {member.authorName}
      </h3>
    </>
  );

  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-sm">
      {profileHref ? (
        <Link href={profileHref} className="group block min-w-0 rounded-md">
          {identity}
        </Link>
      ) : (
        <div className="min-w-0">{identity}</div>
      )}
      {member.authorRole ? (
        <p className="mt-1 text-sm text-muted-foreground">{member.authorRole}</p>
      ) : null}
      {member.socialLinks.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {member.socialLinks.map((link) => (
            <li key={link.id}>
              <SocialNavLink link={toSocialNavLink(link)} />
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

export async function TeamSectionBlock({ record, locale }: TeamSectionBlockProps) {
  const title = readCdaString(record as Record<string, unknown>, "title", "title");
  const subtitle = readCdaString(record as Record<string, unknown>, "subtitle", "subtitle");
  const members = resolveTeamMembers(record as Record<string, unknown>);
  if (members.length === 0) return null;

  const headingId = `team-section-${record.id}`;
  const jsonLd = buildTeamSectionJsonLd(locale, record.id, members, title || undefined);
  const nonce = jsonLd ? await getNonce() : undefined;

  return (
    <section
      {...cmsBlockAttrs(record)}
      data-datocms-content-link-boundary=""
      className="not-prose my-12 w-full py-6"
      {...(title
        ? { "aria-labelledby": headingId }
        : { "aria-label": FALLBACK_SECTION_LABEL[locale] })}
    >
      {jsonLd ? <JsonLdScriptSync graph={jsonLd} nonce={nonce} /> : null}
      <Container size="lg" name="TeamSection" className="flex flex-col gap-10">
        {title || subtitle ? (
          <header className="mx-auto max-w-3xl text-center">
            {title ? (
              <h2
                id={headingId}
                className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
              >
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p className={cn("text-base text-muted-foreground", title && "mt-2")}>{subtitle}</p>
            ) : null}
          </header>
        ) : null}

        <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <li key={member.id} className="min-w-0">
              <MemberCard member={member} locale={locale} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
