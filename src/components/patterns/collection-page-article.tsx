import { Container } from "@/components/atoms/container";
import { BreadcrumbNav } from "@/components/patterns/breadcrumb-nav";
import { CatalogFilters } from "@/components/patterns/catalog-filters";
import { CatalogProductCard } from "@/components/patterns/catalog-product-card";
import { ViewItemListTracker } from "@/components/patterns/view-item-list-tracker";
import { JsonLdScript } from "@/components/patterns/seo-manager";
import { ShopifyCdnPreconnect } from "@/components/patterns/shopify-cdn-preconnect";
import type { AppLocale } from "@/constants/i18n";
import type {
  StorefrontCollection,
  StorefrontCollectionProduct,
} from "@/infra/shopify/storefront";
import {
  catalogFacetsActive,
  type CatalogFilters as CatalogFiltersState,
} from "@/lib/catalog/catalog-filters";
import { collectionPagePath } from "@/lib/datocms/collection-page-path";
import type { CatalogFiltersCopy } from "@/lib/i18n/catalog-filters-copy";
import { buildCollectionPageJsonLd } from "@/lib/seo/build-collection-page-jsonld";
import { crumbsToNavItems, homeBreadcrumbLabel } from "@/lib/seo/breadcrumb-labels";

type CollectionPageArticleProps = {
  locale: AppLocale;
  handle: string;
  title: string;
  description: string | null;
  catalogPath: string;
  catalogLabel: string;
  storefront: StorefrontCollection | null;
  /** Unfiltered enriched catalog (facet counts). Defaults to `storefront.products`. */
  catalogProducts?: readonly StorefrontCollectionProduct[];
  /** Resolved `ui_string` / code fallback for an empty product grid. */
  emptyLabel: string;
  filters: CatalogFiltersState;
  filtersCopy: CatalogFiltersCopy;
};

export async function CollectionPageArticle({
  locale,
  handle,
  title,
  description,
  catalogPath,
  catalogLabel,
  storefront,
  catalogProducts,
  emptyLabel,
  filters,
  filtersCopy,
}: CollectionPageArticleProps) {
  const path = collectionPagePath(locale, handle);
  const jsonLd = buildCollectionPageJsonLd({
    locale,
    path,
    title,
    description,
    catalog: { name: catalogLabel, path: catalogPath },
    storefront,
  });
  const products = storefront?.products ?? [];
  const baseCatalog = catalogProducts ?? products;
  const filtersOn = catalogFacetsActive(filters);
  const emptyMessage = filtersOn ? filtersCopy.filtersEmpty : emptyLabel;

  return (
    <Container as="article" size="lg" name="CollectionPage" className="py-12">
      <ShopifyCdnPreconnect />
      <JsonLdScript graph={jsonLd} />
      <header className="space-y-4">
        <BreadcrumbNav
          locale={locale}
          items={crumbsToNavItems([
            { name: homeBreadcrumbLabel(locale), path: `/${locale}` },
            { name: catalogLabel, path: catalogPath },
            { name: title, path },
          ])}
        />
        <h1 className="type-display">{title}</h1>
        {description ? <p className="type-lead whitespace-pre-line">{description}</p> : null}
      </header>

      <ViewItemListTracker itemListId={handle} itemListName={title} products={products} />
      <div className="mt-10">
        <CatalogFilters
          locale={locale}
          pathname={path}
          filters={filters}
          catalog={baseCatalog}
          resultCount={products.length}
          copy={filtersCopy}
        >
          {products.length > 0 ? (
            <ul className="m-0 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <li key={product.handle}>
                  <CatalogProductCard locale={locale} product={product} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="type-body m-0">{emptyMessage}</p>
          )}
        </CatalogFilters>
      </div>
    </Container>
  );
}
