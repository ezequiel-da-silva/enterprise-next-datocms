import { DatoResponsivePicture } from "@/components/patterns/dato-responsive-picture";
import { StructuredTextRenderer } from "@/components/patterns/structured-text-renderer";
import type { AppLocale } from "@/constants/i18n";
import type { AuthorDetailRecord } from "@/infra/datocms/types-blog";
import type { CdaStructuredTextValue } from "datocms-structured-text-utils";
import Link from "next/link";

type AuthorSectionProps = {
  author: AuthorDetailRecord;
  locale: AppLocale;
  contentLinkGroup: boolean;
};

export function AuthorSection({ author, locale, contentLinkGroup }: AuthorSectionProps) {
  const avatarMobile = author.avatarBio?.asset;
  const avatarDesktop = author.avatarBio?.assetDesktop;
  const bio = author.authorBio;
  const bioData: CdaStructuredTextValue | null =
    bio && bio.value
      ? {
          value: bio.value,
          blocks: bio.blocks as CdaStructuredTextValue["blocks"],
          links: bio.links as CdaStructuredTextValue["links"],
          inlineBlocks: bio.inlineBlocks,
        }
      : null;

  const social = author.authorSocialLinks;

  return (
    <section className="mt-12 rounded-xl border border-border bg-muted/20 p-6 ring-1 ring-border/40" aria-labelledby={`autor-${author.id}`}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="shrink-0 overflow-hidden rounded-full border border-border bg-background shadow-sm ring-2 ring-border/50">
          {avatarMobile?.url ? (
            <DatoResponsivePicture
              mobile={avatarMobile}
              desktop={avatarDesktop}
              className="size-24 object-cover sm:size-28"
              sizes="112px"
              fallbackAlt={author.authorName}
            />
          ) : (
            <div className="flex size-24 items-center justify-center text-xs text-muted-foreground sm:size-28">Sem foto</div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <h2 id={`autor-${author.id}`} className="text-lg font-semibold tracking-tight text-foreground">
              {author.authorName}
            </h2>
            <p className="text-sm text-muted-foreground">
              <Link className="font-medium text-primary underline-offset-4 hover:underline" href={`/${locale}/blog/author/${author.authorSlug}`}>
                Ver perfil do autor
              </Link>
            </p>
          </div>
          {bioData ? <StructuredTextRenderer data={bioData} contentLinkGroup={contentLinkGroup} locale={locale} /> : null}
          {social?.url ? (
            <p className="text-sm">
              <a
                href={social.url}
                className="font-medium text-primary underline-offset-4 hover:underline"
                rel="noopener noreferrer"
                target="_blank"
              >
                {social.plataforma?.trim() ? social.plataforma : "Perfil"}
              </a>
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
