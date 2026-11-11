import { Container } from "@/components/atoms/container";
import { BreadcrumbNav } from "@/components/patterns/breadcrumb-nav";
import { CatalogProductCard } from "@/components/patterns/catalog-product-card";
import { ViewItemListTracker } from "@/components/patterns/view-item-list-tracker";
import { JsonLdScript } from "@/components/patterns/seo-manager";
import { ShopifyCdnPreconnect } from "@/components/patterns/shopify-cdn-preconnect";
import type { AppLocale } from "@/constants/i18n";
import type { StorefrontCollection } from "@/infra/shopify/storefront";
import { collectionPagePath } from "@/lib/datocms/collection-page-path";
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
  /** Resolved `ui_string` / code fallback for an empty product grid. */
  emptyLabel: string;
};

export async function CollectionPageArticle({
  locale,
  handle,
  title,
  description,
  catalogPath,
  catalogLabel,
  storefront,
  emptyLabel,
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
      {products.length > 0 ? (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <li key={product.handle}>
              <CatalogProductCard locale={locale} product={product} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="type-body mt-10">{emptyLabel}</p>
      )}
    </Container>
  );
}
