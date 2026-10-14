import { Container } from "@/components/atoms/container";
import type { AddToCartAction } from "@/components/patterns/add-to-cart-button";
import { BreadcrumbNav } from "@/components/patterns/breadcrumb-nav";
import {
  ProductVariantPicker,
  type ProductPickerCart,
  type ProductPickerCopy,
  type ProductPickerImage,
  type ProductPickerVariant,
} from "@/components/patterns/product-variant-picker";
import { JsonLdScript } from "@/components/patterns/seo-manager";
import type { AppLocale } from "@/constants/i18n";
import { isShopifyVariantId } from "@/core/entities/cart";
import type { StorefrontProduct, StorefrontProductImage } from "@/infra/shopify/storefront";
import { productPagePath } from "@/lib/datocms/product-page-path";
import type { CartCopy } from "@/lib/i18n/cart-copy";
import type { MarketPolicy } from "@/lib/seo/merchant-policy";
import { buildProductPageJsonLd } from "@/lib/seo/build-product-page-jsonld";
import { getOrganizationName } from "@/lib/seo/site-config";
import { crumbsToNavItems, homeBreadcrumbLabel } from "@/lib/seo/breadcrumb-labels";
import { cartPath, isCartEnabled } from "@/lib/shopify/cart-cookie";
import { formatStorefrontMoney } from "@/lib/shopify/format-money";

type ProductPageArticleProps = {
  locale: AppLocale;
  handle: string;
  title: string;
  description: string | null;
  catalogPath: string;
  catalogLabel: string;
  storefront: StorefrontProduct | null;
  /** Server Action do carrinho; sem ela (ou com a flag desligada) o botão não aparece. */
  addToCartAction?: AddToCartAction;
  /** Resolved in `app/` (CMS `ui_strings` over the built-in copy). */
  cartCopy: CartCopy;
  /** Shipping/returns of the locale's market (Dato `market_policy`); `null` omits both JSON-LD blocks. */
  marketPolicy: MarketPolicy | null;
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

function pickerCart(
  locale: AppLocale,
  copy: CartCopy,
  variants: ProductPickerVariant[],
  action: AddToCartAction | undefined,
): ProductPickerCart | undefined {
  if (!action || !isCartEnabled() || !variants.every((variant) => isShopifyVariantId(variant.id))) {
    return undefined;
  }
  const { addToCart, adding, soldOut, viewCart } = copy;
  return { action, locale, cartHref: cartPath(locale), copy: { addToCart, adding, soldOut, viewCart } };
}

function pickerImages(title: string, storefront: StorefrontProduct): ProductPickerImage[] {
  const source = storefront.images.length > 0 ? storefront.images : [storefront.featuredImage];
  return source.flatMap((image) => {
    const mapped = toPickerImage(image, title);
    return mapped ? [mapped] : [];
  });
}

export function ProductPageArticle({
  locale,
  handle,
  title,
  description,
  catalogPath,
  catalogLabel,
  storefront,
  addToCartAction,
  cartCopy,
  marketPolicy,
}: ProductPageArticleProps) {
  const path = productPagePath(locale, handle);
  const jsonLd = buildProductPageJsonLd({
    locale,
    path,
    title,
    description,
    catalog: { name: catalogLabel, path: catalogPath },
    storefront,
    brandName: getOrganizationName(),
    policy: marketPolicy,
  });
  const variants = storefront ? pickerVariants(locale, title, storefront) : null;

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

      {storefront && variants ? (
        <ProductVariantPicker
          variants={variants}
          images={pickerImages(title, storefront)}
          copy={pickerCopy(locale)}
          cart={pickerCart(locale, cartCopy, variants, addToCartAction)}
        />
      ) : null}
    </Container>
  );
}
