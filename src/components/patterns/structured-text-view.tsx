import type { AppLocale } from "@/constants/i18n";
import { StructuredTextBlockView } from "@/components/patterns/structured-text-block-view";
import { structuredTextDatoNodeRules } from "@/components/patterns/structured-text-dato-rules";
import type { UserReviewSubmitAction } from "@/core/entities/user-review";
import type { PageStructuredTextBlock } from "@/infra/datocms/types-page";
import { resolveStructuredTextRecordLink } from "@/lib/datocms/st-record-link";
import type { CdaStructuredTextValue } from "datocms-structured-text-utils";
import { StructuredText } from "react-datocms/structured-text";

type StructuredTextViewProps = {
  data: CdaStructuredTextValue | null | undefined;
  contentLinkGroup: boolean;
  locale: AppLocale;
  submitUserReview?: UserReviewSubmitAction;
};

/**
 * Renderer unificado de Structured Text (Page, Post, Author, Category, etc.).
 * Usa `resolveStructuredTextRecordLink` — no ST de Page o CDA só expõe `PageRecord` em links.
 */
export function StructuredTextView({
  data,
  contentLinkGroup,
  locale,
  submitUserReview,
}: StructuredTextViewProps) {
  if (!data) {
    return null;
  }

  const body = (
    <div className="structured-text max-w-none text-foreground [&_a]:text-primary [&_a]:underline-offset-4 [&_h1]:mt-8 [&_h1]:text-3xl [&_h1]:font-semibold [&_h2]:mt-6 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mt-4 [&_h3]:text-xl [&_h3]:font-semibold [&_p]:mt-4 [&_p]:leading-relaxed [&_p]:text-muted-foreground">
      <StructuredText
        data={data}
        customNodeRules={structuredTextDatoNodeRules}
        renderLinkToRecord={({ record, children, transformedMeta }) => {
          const resolved = resolveStructuredTextRecordLink(record as Record<string, unknown>, locale);
          if (resolved) {
            return (
              <a
                {...transformedMeta}
                href={resolved.href}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {children}
              </a>
            );
          }
          return <span {...transformedMeta}>{children}</span>;
        }}
        renderInlineRecord={({ record }) => {
          const resolved = resolveStructuredTextRecordLink(record as Record<string, unknown>, locale);
          if (resolved) {
            return (
              <span data-datocms-content-link-boundary="">
                <a
                  href={resolved.href}
                  className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-muted/90 px-2.5 py-1 text-sm font-medium text-primary shadow-sm ring-1 ring-border/60 hover:bg-muted"
                  title={resolved.label}
                >
                  <span className="size-1.5 shrink-0 rounded-full bg-amber-400" aria-hidden />
                  <span className="truncate">{resolved.label}</span>
                </a>
              </span>
            );
          }
          return (
            <span data-datocms-content-link-boundary="" className="text-muted-foreground">
              {"id" in record ? `[${String(record.id)}]` : "…"}
            </span>
          );
        }}
        renderBlock={({ record }) => (
          <StructuredTextBlockView
            record={record as PageStructuredTextBlock}
            locale={locale}
            contentLinkGroup={contentLinkGroup}
            submitUserReview={submitUserReview}
          />
        )}
        renderInlineBlock={({ record }) => (
          <span data-datocms-content-link-boundary="">
            <StructuredTextBlockView
              record={record as PageStructuredTextBlock}
              locale={locale}
              contentLinkGroup={contentLinkGroup}
              submitUserReview={submitUserReview}
            />
          </span>
        )}
      />
    </div>
  );

  if (contentLinkGroup) {
    return <div data-datocms-content-link-group="">{body}</div>;
  }

  return body;
}
