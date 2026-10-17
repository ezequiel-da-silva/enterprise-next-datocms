"use client";

import { CartDrawer } from "@/components/patterns/cart-drawer";
import { CartDrawerProvider } from "@/components/patterns/cart-drawer-context";
import type { AppLocale } from "@/constants/i18n";
import type { CartSnapshot } from "@/core/entities/cart";
import type { CartDrawerLineActions } from "@/components/patterns/cart-drawer-line-actions";
import type { CartDrawerCopy } from "@/lib/i18n/cart-drawer-copy";
import type { ReactNode } from "react";

type CartChromeProps = {
  locale: AppLocale;
  copy: CartDrawerCopy;
  loadCartSnapshot: (locale: AppLocale) => Promise<CartSnapshot | null>;
  lineActions: CartDrawerLineActions;
  children: ReactNode;
};

/** Client boundary: quick-cart context + drawer portal when the shop cart is enabled. */
export function CartChrome({ locale, copy, loadCartSnapshot, lineActions, children }: CartChromeProps) {
  return (
    <CartDrawerProvider locale={locale} copy={copy} loadCartSnapshot={loadCartSnapshot} lineActions={lineActions}>
      {children}
      <CartDrawer />
    </CartDrawerProvider>
  );
}
