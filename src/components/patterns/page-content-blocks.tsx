import type { AppLocale } from "@/constants/i18n";
import { StructuredTextBlockView } from "@/components/patterns/structured-text-block-view";
import type { LatestPostsCatalog } from "@/infra/datocms/types-blog";
import type { CatalogFilters } from "@/lib/catalog/catalog-filters";
import type { ProductsListingCatalog } from "@/lib/datocms/resolve-products-section";
import type { SearchResultsPayload } from "@/lib/datocms/search-hit";
import type { ContactActionState } from "@/core/entities/contact";
import type { UserReviewSubmitAction } from "@/core/entities/user-review";
import type { PageContentBlock, PageStructuredTextBlock } from "@/infra/datocms/types-page";
import type { CatalogFiltersCopy } from "@/lib/i18n/catalog-filters-copy";
import type { ProductsSectionCmsCopy } from "@/lib/i18n/products-section-copy";
import type { VideoUiCopy } from "@/lib/i18n/video-ui-copy";

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
  productsCatalog?: ProductsListingCatalog | Promise<ProductsListingCatalog>;
  productsCmsCopy?: ProductsSectionCmsCopy;
  videoCopy?: VideoUiCopy;
  searchQuery?: string;
  searchFormAction?: string;
  searchResults?: SearchResultsPayload | Promise<SearchResultsPayload>;
  catalogFilters?: CatalogFilters;
  catalogFiltersCopy?: CatalogFiltersCopy;
  catalogFiltersPath?: string;
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
  productsCatalog,
  productsCmsCopy,
  videoCopy,
  searchQuery,
  searchFormAction,
  searchResults,
  catalogFilters,
  catalogFiltersCopy,
  catalogFiltersPath,
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
      productsCatalog={productsCatalog}
      productsCmsCopy={productsCmsCopy}
      videoCopy={videoCopy}
      searchQuery={searchQuery}
      searchFormAction={searchFormAction}
      searchResults={searchResults}
      catalogFilters={catalogFilters}
      catalogFiltersCopy={catalogFiltersCopy}
      catalogFiltersPath={catalogFiltersPath}
    />
  ));

  if (contentLinkGroup) {
    return <div data-datocms-content-link-group="">{list}</div>;
  }

  return list;
}
