import { removeCartLine, updateCartLine } from "@/app/actions/cart";
import { CartView } from "@/components/sections/cart-view";
import { isAppLocale } from "@/constants/i18n";
import { getProductsIndexPage, productsIndexPath } from "@/infra/datocms/get-products-index-page";
import { getCartFromCookie } from "@/infra/shopify/cart";
import { buildMetadata } from "@/lib/seo";
import { buildUnavailableMetadata } from "@/lib/seo/build-unavailable-metadata";
import { cartCopy } from "@/lib/i18n/cart-copy";
import { CART_COOKIE, cartPath, isCartEnabled } from "@/lib/shopify/cart-cookie";
import type { Metadata } from "next";
import { cookies, draftMode } from "next/headers";
import { notFound } from "next/navigation";

type CartPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: CartPageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isCartEnabled() || !isAppLocale(slug)) return buildUnavailableMetadata("Cart");
  const copy = cartCopy(slug);
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
  const [cart, catalog] = await Promise.all([
    getCartFromCookie((await cookies()).get(CART_COOKIE)?.value, slug),
    getProductsIndexPage(slug, isEnabled),
  ]);
  return (
    <CartView
      locale={slug}
      cart={cart}
      shopPath={productsIndexPath(slug, catalog)}
      actions={{ updateLine: updateCartLine, removeLine: removeCartLine }}
    />
  );
}
