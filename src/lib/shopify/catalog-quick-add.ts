import type { AddToCartAction, AddToCartCopy } from "@/components/patterns/add-to-cart-button";
import type { CatalogProductCardQuickAdd } from "@/components/patterns/catalog-product-card";
import type { AppLocale } from "@/constants/i18n";
import type { CartCopy } from "@/lib/i18n/cart-copy";
import { quickAddCopy } from "@/lib/i18n/quick-add-copy";
import { cartPath, isCartEnabled } from "@/lib/shopify/cart-cookie";

/** Build card quick-add props when cart is enabled; otherwise `null`. */
export function resolveCatalogQuickAdd(
  locale: AppLocale,
  action: AddToCartAction | undefined,
  cartCopy: CartCopy | undefined,
): CatalogProductCardQuickAdd | null {
  if (!action || !cartCopy || !isCartEnabled()) return null;
  const atc: AddToCartCopy = {
    addToCart: cartCopy.addToCart,
    adding: cartCopy.adding,
    soldOut: cartCopy.soldOut,
    viewCart: cartCopy.viewCart,
  };
  return {
    action,
    cartHref: cartPath(locale),
    cartCopy: atc,
    labels: quickAddCopy(locale),
  };
}
