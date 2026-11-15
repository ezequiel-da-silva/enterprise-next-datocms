import type { AppLocale } from "@/constants/i18n";
import { ProductInlineCard } from "@/components/patterns/product-inline-card";
import { StructuredTextBlockView } from "@/components/patterns/structured-text-block-view";
import { structuredTextDatoNodeRules } from "@/components/patterns/structured-text-dato-rules";
import type { UserReviewSubmitAction } from "@/core/entities/user-review";
import type { PageStructuredTextBlock } from "@/infra/datocms/types-page";
import type { StorefrontCollectionProduct } from "@/infra/shopify/storefront";
import { resolveStructuredTextRecordLink } from "@/lib/datocms/st-record-link";
import type { VideoUiCopy } from "@/lib/i18n/video-ui-copy";
import type { CdaStructuredTextValue } from "datocms-structured-text-utils";
import { stripStega } from "react-datocms/stega";
import { StructuredText } from "react-datocms/structured-text";

type StructuredTextViewProps = {
  data: CdaStructuredTextValue | null | undefined;
  contentLinkGroup: boolean;
  locale: AppLocale;
  submitUserReview?: UserReviewSubmitAction;
  videoCopy?: VideoUiCopy;
  /**
   * Compact cards for inline `ProductPageRecord`s, keyed by Shopify handle (resolved in `app/`
   * with Storefront prices). Inline products missing here keep the plain pill link.
   */
  productCardsByHandle?: Readonly<Record<string, StorefrontCollectionProduct>>;
};

function productCardForRecord(
  record: Record<string, unknown>,
  cards: StructuredTextViewProps["productCardsByHandle"],
): StorefrontCollectionProduct | null {
  if (!cards || record.__typename !== "ProductPageRecord") return null;
  const handle = typeof record.shopifyHandle === "string" ? stripStega(record.shopifyHandle).trim() : "";
  return (handle && cards[handle]) || null;
}

/**
 * Renderer unificado de Structured Text (Page, Post, Author, Category, etc.).
 * Usa `resolveStructuredTextRecordLink` — no ST de Page o CDA só expõe `PageRecord` em links.
 */
export function StructuredTextView({
  data,
  contentLinkGroup,
  locale,
  submitUserReview,
  videoCopy,
  productCardsByHandle,
}: StructuredTextViewProps) {
  if (!data) {
    return null;
  }

  /* Tipografia dos nós em `globals.css` (`.structured-text`) — assim não vaza para os blocos CMS. */
  const body = (
    <div className="structured-text max-w-none text-foreground">
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
                className="font-medium text-primary underline underline-offset-4"
              >
                {children}
              </a>
            );
          }
          return <span {...transformedMeta}>{children}</span>;
        }}
        renderInlineRecord={({ record }) => {
          const productCard = productCardForRecord(record as Record<string, unknown>, productCardsByHandle);
          if (productCard) {
            return (
              <span data-datocms-content-link-boundary="">
                <ProductInlineCard locale={locale} product={productCard} />
              </span>
            );
          }
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
            submitUserReview={submitUserReview}
            videoCopy={videoCopy}
          />
        )}
        renderInlineBlock={({ record }) => (
          <span data-datocms-content-link-boundary="">
            <StructuredTextBlockView
              record={record as PageStructuredTextBlock}
              locale={locale}
              submitUserReview={submitUserReview}
              videoCopy={videoCopy}
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
