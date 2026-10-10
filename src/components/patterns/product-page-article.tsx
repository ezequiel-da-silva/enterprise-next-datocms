import { Container } from "@/components/atoms/container";
import { BreadcrumbNav } from "@/components/patterns/breadcrumb-nav";
import {
  ProductVariantPicker,
  type ProductPickerCopy,
  type ProductPickerImage,
  type ProductPickerVariant,
} from "@/components/patterns/product-variant-picker";
import { JsonLdScript } from "@/components/patterns/seo-manager";
import type { AppLocale } from "@/constants/i18n";
import type { StorefrontProduct, StorefrontProductImage } from "@/infra/shopify/storefront";
import { productPagePath } from "@/lib/datocms/product-page-path";
import { buildProductPageJsonLd } from "@/lib/seo/build-product-page-jsonld";
import { crumbsToNavItems, homeBreadcrumbLabel } from "@/lib/seo/breadcrumb-labels";
import { formatStorefrontMoney } from "@/lib/shopify/format-money";

type ProductPageArticleProps = {
  locale: AppLocale;
  handle: string;
  title: string;
  description: string | null;
  catalogPath: string;
  catalogLabel: string;
  storefront: StorefrontProduct | null;
};

function availabilityLabel(locale: AppLocale, available: boolean): string {
  if (locale === "pt") return available ? "Em stock" : "Esgotado";
  if (locale === "es") return available ? "En stock" : "Agotado";
  return available ? "In stock" : "Sold out";
}

function pickerCopy(locale: AppLocale): ProductPickerCopy {
  if (locale === "pt") return { thumbnailLabel: "Ver imagem", unavailableSuffix: "(esgotado)" };
  if (locale === "es") return { thumbnailLabel: "Ver imagen", unavailableSuffix: "(agotado)" };
  return { thumbnailLabel: "View image", unavailableSuffix: "(sold out)" };
}

function toPickerImage(image: StorefrontProductImage | null, fallbackAlt: string): ProductPickerImage | null {
  if (!image?.url) return null;
  return {
    url: image.url,
    alt: image.altText?.trim() || fallbackAlt,
    width: image.width && image.width > 0 ? image.width : 800,
    height: image.height && image.height > 0 ? image.height : 800,
  };
}

function pickerVariants(locale: AppLocale, title: string, storefront: StorefrontProduct): ProductPickerVariant[] {
  if (storefront.variants.length === 0) {
    const price = storefront.priceRange.minVariantPrice;
    return [
      {
        id: storefront.id,
        available: storefront.availableForSale,
        priceLabel: formatStorefrontMoney(locale, price.amount, price.currencyCode),
        availabilityLabel: availabilityLabel(locale, storefront.availableForSale),
        options: [],
        image: null,
      },
    ];
  }
  return storefront.variants.map((variant) => ({
    id: variant.id,
    available: variant.availableForSale,
    priceLabel: formatStorefrontMoney(locale, variant.price.amount, variant.price.currencyCode),
    availabilityLabel: availabilityLabel(locale, variant.availableForSale),
    options: variant.selectedOptions,
    image: toPickerImage(variant.image, `${title} — ${variant.title}`),
  }));
}

function pickerImages(title: string, storefront: StorefrontProduct): ProductPickerImage[] {
  const source = storefront.images.length > 0 ? storefront.images : [storefront.featuredImage];
  return source.flatMap((image) => {
    const mapped = toPickerImage(image, title);
    return mapped ? [mapped] : [];
  });
}

export async function ProductPageArticle({
  locale,
  handle,
  title,
  description,
  catalogPath,
  catalogLabel,
  storefront,
}: ProductPageArticleProps) {
  const path = productPagePath(locale, handle);
  const jsonLd = buildProductPageJsonLd({
    locale,
    path,
    title,
    description,
    catalog: { name: catalogLabel, path: catalogPath },
    storefront,
  });

  return (
    <Container as="article" size="sm" name="ProductPage" className="py-12">
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
          <p className="whitespace-pre-line text-lg text-muted-foreground">{description}</p>
        ) : null}
      </header>

      {storefront ? (
        <ProductVariantPicker
          variants={pickerVariants(locale, title, storefront)}
          images={pickerImages(title, storefront)}
          copy={pickerCopy(locale)}
        />
      ) : null}
    </Container>
  );
}
