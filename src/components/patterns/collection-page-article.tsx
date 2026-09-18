import { Container } from "@/components/atoms/container";
import { BreadcrumbNav } from "@/components/patterns/breadcrumb-nav";
import { CatalogProductCard } from "@/components/patterns/catalog-product-card";
import { JsonLdScript } from "@/components/patterns/seo-manager";
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
};

export async function CollectionPageArticle({
  locale,
  handle,
  title,
  description,
  catalogPath,
  catalogLabel,
  storefront,
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
        <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description ? (
          <p className="max-w-3xl whitespace-pre-line text-lg text-muted-foreground">{description}</p>
        ) : null}
      </header>

      {products.length > 0 ? (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <li key={product.handle}>
              <CatalogProductCard locale={locale} product={product} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-10 text-muted-foreground">
          {locale === "pt"
            ? "Nenhum produto nesta coleção."
            : locale === "es"
              ? "Ningún producto en esta colección."
              : "No products in this collection."}
        </p>
      )}
    </Container>
  );
}
