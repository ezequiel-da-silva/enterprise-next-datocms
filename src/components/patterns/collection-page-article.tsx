import { Container } from "@/components/atoms/container";
import { BreadcrumbNav } from "@/components/patterns/breadcrumb-nav";
import { JsonLdScript } from "@/components/patterns/seo-manager";
import type { AppLocale } from "@/constants/i18n";
import type { StorefrontCollection } from "@/infra/shopify/storefront";
import { collectionPagePath } from "@/lib/datocms/collection-page-path";
import { productPagePath } from "@/lib/datocms/product-page-path";
import { buildCollectionPageJsonLd } from "@/lib/seo/build-collection-page-jsonld";
import { crumbsToNavItems, homeBreadcrumbLabel } from "@/lib/seo/breadcrumb-labels";
import Image from "next/image";
import Link from "next/link";

type CollectionPageArticleProps = {
  locale: AppLocale;
  handle: string;
  title: string;
  description: string | null;
  catalogPath: string;
  catalogLabel: string;
  storefront: StorefrontCollection | null;
};

function formatMoney(locale: AppLocale, amount: string, currency: string): string {
  const value = Number.parseFloat(amount);
  const tag = locale === "pt" ? "pt-BR" : locale;
  if (!Number.isFinite(value)) return `${amount} ${currency}`;
  try {
    return new Intl.NumberFormat(tag, { style: "currency", currency }).format(value);
  } catch {
    return `${amount} ${currency}`;
  }
}

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
          {products.map((product) => {
            const href = productPagePath(locale, product.handle);
            const image = product.featuredImage;
            const price = product.priceRange.minVariantPrice;
            return (
              <li key={product.handle}>
                <Link
                  href={href}
                  className="group block overflow-hidden rounded-xl border border-border bg-card shadow-sm ring-1 ring-border/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {image?.url ? (
                    <Image
                      src={image.url}
                      alt={image.altText?.trim() || product.title}
                      width={image.width && image.width > 0 ? image.width : 600}
                      height={image.height && image.height > 0 ? image.height : 600}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="aspect-square h-auto w-full object-cover"
                    />
                  ) : (
                    <div className="aspect-square bg-muted" aria-hidden="true" />
                  )}
                  <div className="space-y-1 p-4">
                    <p className="font-medium text-foreground group-hover:underline">{product.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatMoney(locale, price.amount, price.currencyCode)}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
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
