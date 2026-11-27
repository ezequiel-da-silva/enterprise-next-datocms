"use client";

import { CartDrawer } from "@/components/patterns/cart-drawer";
import { CartDrawerProvider } from "@/components/patterns/cart-drawer-context";
import type { AppLocale } from "@/constants/i18n";
import type { CartSnapshot } from "@/core/entities/cart";
import type { CartDrawerLineActions } from "@/components/patterns/cart-drawer-line-actions";
import type { CartDrawerCopy } from "@/lib/i18n/cart-drawer-copy";
import type { EmptyStateCollection } from "@/lib/storefront/empty-state-collection";
import type { ReactNode } from "react";

type CartChromeProps = {
  locale: AppLocale;
  copy: CartDrawerCopy;
  /** Server-formatted `market_policy` trust (shipping · returns). */
  trustNote?: string | null;
  /** Validated `market_policy.free_shipping_threshold`; null skips the meter. */
  freeShippingThreshold?: number | null;
  /** Market currency for the locale (must match cart currency for the meter). */
  marketCurrencyCode?: string | null;
  /** Normalized flat shipping rate (`"0.00"` = free). */
  shippingRate?: string | null;
  /** Products index (or shop) path for empty-drawer CTA. */
  shopPath: string;
  /** Suggested collections for the empty drawer (same source as cart page). */
  suggestedCollections?: EmptyStateCollection[];
  loadCartSnapshot: (locale: AppLocale) => Promise<CartSnapshot | null>;
  lineActions: CartDrawerLineActions;
  children: ReactNode;
};

/** Client boundary: quick-cart context + drawer portal when the shop cart is enabled. */
export function CartChrome({
  locale,
  copy,
  trustNote = null,
  freeShippingThreshold = null,
  marketCurrencyCode = null,
  shippingRate = null,
  shopPath,
  suggestedCollections = [],
  loadCartSnapshot,
  lineActions,
  children,
}: CartChromeProps) {
  return (
    <CartDrawerProvider
      locale={locale}
      copy={copy}
      trustNote={trustNote}
      freeShippingThreshold={freeShippingThreshold}
      marketCurrencyCode={marketCurrencyCode}
      shippingRate={shippingRate}
      shopPath={shopPath}
      suggestedCollections={suggestedCollections}
      loadCartSnapshot={loadCartSnapshot}
      lineActions={lineActions}
    >
      {children}
      <CartDrawer />
    </CartDrawerProvider>
  );
}
