import type { AppLocale } from "@/constants/i18n";
import { StructuredTextBlockView } from "@/components/patterns/structured-text-block-view";
import type { LatestPostsCatalog } from "@/infra/datocms/types-blog";
import type { UserReviewSubmitAction } from "@/core/entities/user-review";
import type { PageContentBlock, PageStructuredTextBlock } from "@/infra/datocms/types-page";

type PageContentBlocksProps = {
  records: PageContentBlock[];
  locale: AppLocale;
  contentLinkGroup: boolean;
  submitUserReview?: UserReviewSubmitAction;
  latestPostsCatalog?: LatestPostsCatalog | Promise<LatestPostsCatalog>;
};

/**
 * Corpo da Page: Modular Content `contentPage` (lista ordenada de secções).
 */
export function PageContentBlocks({
  records,
  locale,
  contentLinkGroup,
  submitUserReview,
  latestPostsCatalog,
}: PageContentBlocksProps) {
  if (records.length === 0) {
    return null;
  }

  const list = records.map((record) => (
    <StructuredTextBlockView
      key={record.id}
      record={record as PageStructuredTextBlock}
      locale={locale}
      submitUserReview={submitUserReview}
      latestPostsCatalog={latestPostsCatalog}
    />
  ));

  if (contentLinkGroup) {
    return <div data-datocms-content-link-group="">{list}</div>;
  }

  return list;
}
