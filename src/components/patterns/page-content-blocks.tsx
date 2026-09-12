import type { AppLocale } from "@/constants/i18n";
import { StructuredTextBlockView } from "@/components/patterns/structured-text-block-view";
import type { LatestPostsCatalog } from "@/infra/datocms/types-blog";
import type { SearchResultsPayload } from "@/lib/datocms/search-hit";
import type { ContactActionState } from "@/core/entities/contact";
import type { UserReviewSubmitAction } from "@/core/entities/user-review";
import type { PageContentBlock, PageStructuredTextBlock } from "@/infra/datocms/types-page";

type ContactSubmitAction = (
  prev: ContactActionState,
  formData: FormData,
) => Promise<ContactActionState>;

type PageContentBlocksProps = {
  records: PageContentBlock[];
  locale: AppLocale;
  contentLinkGroup: boolean;
  submitUserReview?: UserReviewSubmitAction;
  submitContact?: ContactSubmitAction;
  latestPostsCatalog?: LatestPostsCatalog | Promise<LatestPostsCatalog>;
  searchQuery?: string;
  searchFormAction?: string;
  searchResults?: SearchResultsPayload | Promise<SearchResultsPayload>;
};

/**
 * Corpo da Page: Modular Content `contentPage` (lista ordenada de secções).
 */
export function PageContentBlocks({
  records,
  locale,
  contentLinkGroup,
  submitUserReview,
  submitContact,
  latestPostsCatalog,
  searchQuery,
  searchFormAction,
  searchResults,
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
      submitContact={submitContact}
      latestPostsCatalog={latestPostsCatalog}
      searchQuery={searchQuery}
      searchFormAction={searchFormAction}
      searchResults={searchResults}
    />
  ));

  if (contentLinkGroup) {
    return <div data-datocms-content-link-group="">{list}</div>;
  }

  return list;
}
