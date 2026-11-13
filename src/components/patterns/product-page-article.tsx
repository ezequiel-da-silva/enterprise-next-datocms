import { Container } from "@/components/atoms/container";
import type { AddToCartAction } from "@/components/patterns/add-to-cart-button";
import type { BuyNowAction } from "@/components/patterns/buy-now-button";
import { BreadcrumbNav } from "@/components/patterns/breadcrumb-nav";
import { ProductReviewsSection, type ProductReviewItem } from "@/components/patterns/product-reviews-section";
import { ProductSizeGuide } from "@/components/patterns/product-size-guide";
import { ProductSpecsTable, type ProductSpecValues } from "@/components/patterns/product-specs-table";
import {
  ProductVariantPicker,
  type ProductPickerCart,
  type ProductPickerImage,
  type ProductPickerVariant,
  type ProductPickerWishlist,
} from "@/components/patterns/product-variant-picker";
import { JsonLdScript } from "@/components/patterns/seo-manager";
import { ShopifyCdnPreconnect } from "@/components/patterns/shopify-cdn-preconnect";
import type { AppLocale } from "@/constants/i18n";
import { isShopifyVariantId } from "@/core/entities/cart";
import type { StorefrontProduct, StorefrontProductImage } from "@/infra/shopify/storefront";
import { cmsRecordAttrs } from "@/lib/datocms/cms-block-attrs";
import { parseSizeChart } from "@/lib/datocms/parse-size-chart";
import { productPagePath } from "@/lib/datocms/product-page-path";
import type { CartCopy } from "@/lib/i18n/cart-copy";
import { snowboardBadgeLabel, type PdpCopy } from "@/lib/i18n/pdp-copy";
import {
  currencyForShopifyCountry,
  formatMarketPolicyTrust,
} from "@/lib/seo/format-market-policy-trust";
import type { MarketPolicy } from "@/lib/seo/merchant-policy";
import { buildProductPageJsonLd } from "@/lib/seo/build-product-page-jsonld";
import { getOrganizationName } from "@/lib/seo/site-config";
import { crumbsToNavItems, homeBreadcrumbLabel } from "@/lib/seo/breadcrumb-labels";
import { cartPath, isCartEnabled } from "@/lib/shopify/cart-cookie";
import { shopifyCountryFromLocale } from "@/lib/shopify/locale-map";
import { formatStorefrontMoney } from "@/lib/shopify/format-money";

type ProductPageArticleProps = {
  locale: AppLocale;
  handle: string;
  title: string;
  description: string | null;
  /** Raw `product_page.badge` api key from CDA. */
  badge?: string | null;
  catalogPath: string;
  catalogLabel: string;
  storefront: StorefrontProduct | null;
  /** Server Action do carrinho; sem ela (ou com a flag desligada) o botão não aparece. */
  addToCartAction?: AddToCartAction;
  /** Ephemeral checkout; omit when cart is disabled. */
  buyNowAction?: BuyNowAction;
  /** Resolved in `app/` (CMS `ui_string` over the built-in copy). */
  cartCopy: CartCopy;
  /** Resolved in `app/` (CMS `ui_string` over the built-in copy). */
  pdpCopy: PdpCopy;
  /** Shipping/returns of the locale's market (Dato `market_policy`); `null` omits both JSON-LD blocks. */
  marketPolicy: MarketPolicy | null;
  contentLinkGroup: boolean;
  recordId: string;
  editingUrl: string | null;
  specs: ProductSpecValues;
  sizeChart: unknown;
  reviews?: ProductReviewItem[];
};

function availabilityLabel(copy: PdpCopy, available: boolean): string {
  return available ? copy.inStock : copy.soldOut;
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

function parsePrice(amount: string): number {
  const value = Number(amount);
  return Number.isFinite(value) ? value : 0;
}

function variantLabel(options: { name: string; value: string }[], fallbackTitle?: string): string | undefined {
  if (options.length > 0) {
    return options.map((option) => `${option.name}: ${option.value}`).join(" · ");
  }
  const trimmed = fallbackTitle?.trim();
  return trimmed && trimmed !== "Default Title" ? trimmed : undefined;
}

function pickerVariants(locale: AppLocale, title: string, storefront: StorefrontProduct, copy: PdpCopy): ProductPickerVariant[] {
  const itemId = storefront.handle || storefront.id;
  if (storefront.variants.length === 0) {
    const price = storefront.priceRange.minVariantPrice;
    return [
      {
        id: storefront.id,
        available: storefront.availableForSale,
        priceLabel: formatStorefrontMoney(locale, price.amount, price.currencyCode),
        availabilityLabel: availabilityLabel(copy, storefront.availableForSale),
        options: [],
        image: null,
        quantityAvailable: null,
        itemId,
        itemName: title,
        price: parsePrice(price.amount),
        currency: price.currencyCode || "USD",
      },
    ];
  }
  return storefront.variants.map((variant) => ({
    id: variant.id,
    available: variant.availableForSale,
    priceLabel: formatStorefrontMoney(locale, variant.price.amount, variant.price.currencyCode),
    availabilityLabel: availabilityLabel(copy, variant.availableForSale),
    options: variant.selectedOptions,
    image: toPickerImage(variant.image, `${title} — ${variant.title}`),
    quantityAvailable: variant.quantityAvailable,
    itemId,
    itemName: title,
    price: parsePrice(variant.price.amount),
    currency: variant.price.currencyCode || "USD",
    itemVariant: variantLabel(variant.selectedOptions, variant.title),
  }));
}

function pickerCart(
  locale: AppLocale,
  cartCopy: CartCopy,
  pdpCopy: PdpCopy,
  variants: ProductPickerVariant[],
  addToCartAction: AddToCartAction | undefined,
  buyNowAction: BuyNowAction | undefined,
): ProductPickerCart | undefined {
  if (!addToCartAction || !isCartEnabled() || !variants.every((variant) => isShopifyVariantId(variant.id))) {
    return undefined;
  }
  const { addToCart, adding, soldOut, viewCart } = cartCopy;
  return {
    action: addToCartAction,
    locale,
    cartHref: cartPath(locale),
    copy: { addToCart, adding, soldOut, viewCart },
    buyNowAction,
    buyNowCopy: buyNowAction
      ? { buyNow: pdpCopy.buyNow, buying: pdpCopy.buying, soldOut: pdpCopy.soldOut }
      : undefined,
  };
}

function pickerWishlist(
  locale: AppLocale,
  handle: string,
  title: string,
  storefront: StorefrontProduct,
): ProductPickerWishlist {
  const price = storefront.priceRange.minVariantPrice;
  return {
    locale,
    item: {
      handle,
      title,
      imageUrl: storefront.featuredImage?.url ?? null,
      priceAmount: price.amount,
      currencyCode: price.currencyCode,
    },
  };
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
  badge = null,
  catalogPath,
  catalogLabel,
  storefront,
  addToCartAction,
  buyNowAction,
  cartCopy,
  pdpCopy,
  marketPolicy,
  contentLinkGroup,
  recordId,
  editingUrl,
  specs,
  sizeChart,
  reviews = [],
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
    reviews,
  });
  const variants = storefront ? pickerVariants(locale, title, storefront, pdpCopy) : null;
  const sizeRows = parseSizeChart(sizeChart);
  const trust = formatMarketPolicyTrust(
    locale,
    marketPolicy,
    currencyForShopifyCountry(shopifyCountryFromLocale(locale)),
  );
  const badgeLabel = snowboardBadgeLabel(locale, badge);
  const paymentHint = locale === "pt" ? pdpCopy.paymentHint.trim() || null : null;
  const editorial = (
    <>
      <h1 className="type-display">{title}</h1>
      {description ? <p className="type-lead whitespace-pre-line">{description}</p> : null}
    </>
  );
  const techDetails = (
    <>
      <ProductSpecsTable
        locale={locale}
        labels={{
          profile: pdpCopy.specProfile,
          flex: pdpCopy.specFlex,
          terrain: pdpCopy.specTerrain,
          riderLevel: pdpCopy.specRiderLevel,
          core: pdpCopy.specCore,
        }}
        values={specs}
      />
      <ProductSizeGuide
        summary={pdpCopy.sizeGuideSummary}
        lengthLabel={pdpCopy.sizeLength}
        weightLabel={pdpCopy.sizeWeight}
        waistLabel={pdpCopy.sizeWaist}
        rows={sizeRows}
      />
    </>
  );

  return (
    <Container
      as="article"
      size="lg"
      name="ProductPage"
      className="py-12"
      data-datocms-content-link-boundary=""
      {...cmsRecordAttrs({ __typename: "ProductPageRecord", id: recordId })}
      {...(editingUrl ? { "data-datocms-content-link-url": editingUrl } : {})}
    >
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
        {contentLinkGroup ? <div data-datocms-content-link-group="">{editorial}</div> : editorial}
      </header>

      {storefront && variants ? (
        <ProductVariantPicker
          variants={variants}
          images={pickerImages(title, storefront)}
          copy={{ thumbnailLabel: pdpCopy.viewImage, unavailableSuffix: pdpCopy.unavailableSuffix }}
          cart={pickerCart(locale, cartCopy, pdpCopy, variants, addToCartAction, buyNowAction)}
          wishlist={pickerWishlist(locale, handle, title, storefront)}
          lowStockTemplate={pdpCopy.lowStockTemplate}
          badgeLabel={badgeLabel}
          shippingTrust={trust.shipping}
          returnsTrust={trust.returns}
          checkoutTrust={pdpCopy.checkoutTrust}
          paymentHint={paymentHint}
        />
      ) : null}

      {techDetails}

      <ProductReviewsSection locale={locale} reviews={reviews} copy={pdpCopy} />
    </Container>
  );
}
