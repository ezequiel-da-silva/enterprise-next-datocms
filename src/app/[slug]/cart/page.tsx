import { removeCartLine, updateCartLine } from "@/app/actions/cart";
import { CartView } from "@/components/sections/cart-view";
import { isAppLocale } from "@/constants/i18n";
import { getEmptyStateCollections } from "@/infra/datocms/get-empty-state-collections";
import { getMarketPolicy } from "@/infra/datocms/get-market-policy";
import { getProductsIndexPage, productsIndexPath } from "@/infra/datocms/get-products-index-page";
import { getCartCopy } from "@/infra/datocms/get-ui-strings";
import { getCartFromCookie } from "@/infra/shopify/cart";
import { buildMetadata } from "@/lib/seo";
import { buildUnavailableMetadata } from "@/lib/seo/build-unavailable-metadata";
import {
  currencyForShopifyCountry,
  formatMarketPolicyTrustNote,
} from "@/lib/seo/format-market-policy-trust";
import { CART_COOKIE, cartPath, isCartEnabled } from "@/lib/shopify/cart-cookie";
import { activeAccessToken, CUSTOMER_COOKIE, readCustomerSession } from "@/lib/shopify/customer-session";
import { shopifyCountryFromLocale } from "@/lib/shopify/locale-map";
import type { Metadata } from "next";
import { cookies, draftMode } from "next/headers";
import { notFound } from "next/navigation";

type CartPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: CartPageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isCartEnabled() || !isAppLocale(slug)) return buildUnavailableMetadata("Cart");
  const copy = await getCartCopy(slug);
  return buildMetadata({
    title: copy.title,
    description: copy.checkoutNote,
    path: cartPath(slug),
    locale: slug,
    noIndex: true,
  });
}

export default async function CartPage({ params }: CartPageProps) {
  const { slug } = await params;
  if (!isCartEnabled() || !isAppLocale(slug)) notFound();
  const { isEnabled } = await draftMode();
  const cookieStore = await cookies();
  const session = readCustomerSession(cookieStore.get(CUSTOMER_COOKIE)?.value);
  const marketCountry = shopifyCountryFromLocale(slug);
  const marketCurrencyCode = currencyForShopifyCountry(marketCountry);
  const [cart, catalog, copy, suggestedCollections, marketPolicy] = await Promise.all([
    getCartFromCookie(cookieStore.get(CART_COOKIE)?.value, slug, activeAccessToken(session)),
    getProductsIndexPage(slug, isEnabled),
    getCartCopy(slug),
    getEmptyStateCollections(slug, isEnabled),
    getMarketPolicy(marketCountry),
  ]);
  const trustNote = formatMarketPolicyTrustNote(slug, marketPolicy, marketCurrencyCode);
  return (
    <CartView
      locale={slug}
      copy={copy}
      cart={cart}
      shopPath={productsIndexPath(slug, catalog)}
      suggestedCollections={suggestedCollections}
      actions={{ updateLine: updateCartLine, removeLine: removeCartLine }}
      trustNote={trustNote}
      freeShippingThreshold={marketPolicy?.freeShippingThreshold ?? null}
      marketCurrencyCode={marketCurrencyCode}
      shippingRate={marketPolicy?.shippingRate ?? null}
    />
  );
}
