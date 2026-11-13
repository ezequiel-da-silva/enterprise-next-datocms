import { Container } from "@/components/atoms/container";
import { Skeleton } from "@/components/atoms/skeleton";
import { CatalogFilters } from "@/components/patterns/catalog-filters";
import { SectionTextHeader } from "@/components/patterns/section-text-header";
import { ShopifyCdnPreconnect } from "@/components/patterns/shopify-cdn-preconnect";
import { BlogPostsSectionBlock } from "@/components/sections/blog-posts-section-block";
import { ProductsSectionInteractive } from "@/components/sections/products-section-interactive";
import type { AppLocale } from "@/constants/i18n";
import type { LatestPostsCatalog } from "@/infra/datocms/types-blog";
import type { ContentListingSectionBlockRecord } from "@/infra/datocms/types-page";
import {
  catalogFacetsActive,
  filterAndSortCatalogProducts,
  type CatalogFilters as CatalogFiltersState,
} from "@/lib/catalog/catalog-filters";
import { cmsBlockAttrs } from "@/lib/datocms/cms-block-attrs";
import { readContentListingSource } from "@/lib/datocms/resolve-content-listing-section";
import {
  applyProductLimit,
  hideSoldOutProducts,
  resolveProductsSectionOptions,
  type ProductsListingCatalog,
} from "@/lib/datocms/resolve-products-section";

import { sectionLandmarkProps, textHeaderFromRecord } from "@/lib/datocms/resolve-text-header";
import type { CatalogFiltersCopy } from "@/lib/i18n/catalog-filters-copy";
import { latestPostsCopy } from "@/lib/i18n/latest-posts-copy";
import {
  productsSectionCopy,
  type ProductsSectionCmsCopy,
} from "@/lib/i18n/products-section-copy";

type ContentListingSectionBlockProps = {
  record: ContentListingSectionBlockRecord;
  locale: AppLocale;
  blogCatalog?: LatestPostsCatalog | Promise<LatestPostsCatalog>;
  productsCatalog?: ProductsListingCatalog | Promise<ProductsListingCatalog>;
  /** CMS overlays for empty + pagination (resolved in `app/`). */
  productsCmsCopy?: ProductsSectionCmsCopy;
  catalogFilters?: CatalogFiltersState;
  catalogFiltersCopy?: CatalogFiltersCopy;
  catalogFiltersPath?: string;
};

export function ContentListingSectionFallback({
  locale,
  record,
}: {
  locale: AppLocale;
  record: ContentListingSectionBlockRecord;
}) {
  const isShopify = readContentListingSource(record as Record<string, unknown>) === "shopify";
  const header = textHeaderFromRecord(record as Record<string, unknown>);
  const label = isShopify
    ? productsSectionCopy(locale).sectionLabel
    : latestPostsCopy(locale).sectionLabel;

  return (
    <section
      {...cmsBlockAttrs(record)}
      data-datocms-content-link-boundary=""
      className="not-prose my-12 w-full py-6"
      aria-busy="true"
      aria-label={header.title || label}
    >
      <Container size="lg" padded={false} name="ContentListingSection" className="flex flex-col gap-10">
        <SectionTextHeader
          header={header}
          headingId={`content-listing-${record.id}`}
          headingClassName="type-heading"
          descriptionClassName="type-lead"
        />
        <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-2 lg:grid-cols-3">
          {["a", "b", "c"].map((key) => (
            <li key={key} className="min-w-0">
              <Skeleton className={`${isShopify ? "aspect-square" : "aspect-video"} w-full rounded-xl`} />
              <Skeleton className="mt-4 h-6 w-3/4" />
              <Skeleton className="mt-2 h-4 w-1/2" />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

export async function ContentListingSectionBlock({
  record,
  locale,
  blogCatalog,
  productsCatalog,
  productsCmsCopy,
  catalogFilters,
  catalogFiltersCopy,
  catalogFiltersPath,
}: ContentListingSectionBlockProps) {
  const raw = record as Record<string, unknown>;
  if (readContentListingSource(raw) === "blog") {
    return <BlogPostsSectionBlock record={record} locale={locale} catalog={blogCatalog} />;
  }

  const copy = productsSectionCopy(locale);
  const cmsCopy: ProductsSectionCmsCopy = productsCmsCopy ?? {
    empty: copy.empty,
    pageOfTemplate: copy.pageOfTemplate,
  };
  const options = resolveProductsSectionOptions(raw, copy.loadMore);
  const header = textHeaderFromRecord(raw);
  const resolvedCatalog = productsCatalog ? await Promise.resolve(productsCatalog) : {};
  const products = resolvedCatalog[record.id] ?? [];
  const filters = catalogFilters;
  const filtered =
    filters != null ? filterAndSortCatalogProducts(products, filters) : products;
  const ranked = options.hasLimit ? hideSoldOutProducts(filtered) : filtered;
  const dataset = applyProductLimit(ranked, options.hasLimit, options.limit, options.displayType);
  const showFilters =
    filters != null &&
    catalogFiltersCopy != null &&
    catalogFiltersPath != null &&
    !options.hasLimit;
  const emptyCopy: ProductsSectionCmsCopy =
    showFilters && catalogFacetsActive(filters) && dataset.length === 0
      ? { ...cmsCopy, empty: catalogFiltersCopy.filtersEmpty }
      : cmsCopy;

  const headingId = `content-listing-${record.id}`;
  const productsInteractive = (
    <ProductsSectionInteractive
      locale={locale}
      products={dataset}
      displayType={options.displayType}
      initialCount={options.initialCount}
      loadMoreStep={options.loadMoreStep}
      loadMoreLabel={options.loadMoreLabel}
      carousel={options.carousel}
      cmsCopy={emptyCopy}
      featuredLayout={options.hasLimit}
    />
  );

  return (
    <section
      {...cmsBlockAttrs(record)}
      data-datocms-content-link-boundary=""
      className="not-prose my-12 w-full py-6"
      id={header.sectionId}
      {...sectionLandmarkProps(header, headingId, copy.sectionLabel)}
    >
      <ShopifyCdnPreconnect />
      <Container size="lg" padded={false} name="ContentListingSection" className="flex flex-col gap-10">
        <SectionTextHeader
          header={header}
          headingId={headingId}
          headingClassName="type-heading"
          descriptionClassName="type-lead"
        />
        {showFilters ? (
          <CatalogFilters
            locale={locale}
            pathname={catalogFiltersPath}
            filters={filters}
            catalog={products}
            resultCount={dataset.length}
            copy={catalogFiltersCopy}
          >
            {productsInteractive}
          </CatalogFilters>
        ) : (
          productsInteractive
        )}
      </Container>
    </section>
  );
}
