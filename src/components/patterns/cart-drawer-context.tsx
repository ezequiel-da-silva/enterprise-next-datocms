"use client";

import type { AppLocale } from "@/constants/i18n";
import type { CartSnapshot } from "@/core/entities/cart";
import type { CartDrawerLineActions } from "@/components/patterns/cart-drawer-line-actions";
import type { CartDrawerCopy } from "@/lib/i18n/cart-drawer-copy";
import { cartPath } from "@/lib/shopify/cart-cookie";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

type CartDrawerContextValue = {
  open: boolean;
  cart: CartSnapshot | null;
  locale: AppLocale;
  copy: CartDrawerCopy;
  cartHref: string;
  lineActions: CartDrawerLineActions;
  returnFocusRef: RefObject<HTMLElement | null>;
  openWithCart: (cart: CartSnapshot, returnFocus?: HTMLElement | null) => void;
  openFromServer: (returnFocus?: HTMLElement | null) => Promise<void>;
  close: () => void;
  syncCart: () => Promise<void>;
  applyCartSnapshot: (snapshot: CartSnapshot) => void;
};

const CartDrawerContext = createContext<CartDrawerContextValue | null>(null);

export function useCartDrawer(): CartDrawerContextValue {
  const ctx = useContext(CartDrawerContext);
  if (!ctx) throw new Error("useCartDrawer must be used within CartDrawerProvider");
  return ctx;
}

export function useOptionalCartDrawer(): CartDrawerContextValue | null {
  return useContext(CartDrawerContext);
}

type LoadCartSnapshot = (locale: AppLocale) => Promise<CartSnapshot | null>;

type CartDrawerProviderProps = {
  locale: AppLocale;
  copy: CartDrawerCopy;
  loadCartSnapshot: LoadCartSnapshot;
  lineActions: CartDrawerLineActions;
  children: ReactNode;
};

export function CartDrawerProvider({
  locale,
  copy,
  loadCartSnapshot,
  lineActions,
  children,
}: CartDrawerProviderProps) {
  const [open, setOpen] = useState(false);
  const [cart, setCart] = useState<CartSnapshot | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => returnFocusRef.current?.focus());
  }, []);

  const openWithCart = useCallback((next: CartSnapshot, returnFocus?: HTMLElement | null) => {
    returnFocusRef.current = returnFocus ?? null;
    setCart(next);
    setOpen(true);
  }, []);

  const openFromServer = useCallback(
    async (returnFocus?: HTMLElement | null) => {
      returnFocusRef.current = returnFocus ?? null;
      const snapshot = await loadCartSnapshot(locale);
      setCart(snapshot);
      setOpen(true);
    },
    [locale, loadCartSnapshot],
  );

  const syncCart = useCallback(async () => {
    setCart(await loadCartSnapshot(locale));
  }, [locale, loadCartSnapshot]);

  const applyCartSnapshot = useCallback((snapshot: CartSnapshot) => {
    setCart(snapshot);
  }, []);

  const value = useMemo(
    () => ({
      open,
      cart,
      locale,
      copy,
      cartHref: cartPath(locale),
      lineActions,
      returnFocusRef,
      openWithCart,
      openFromServer,
      close,
      syncCart,
      applyCartSnapshot,
    }),
    [open, cart, locale, copy, lineActions, openWithCart, openFromServer, close, syncCart, applyCartSnapshot],
  );

  return <CartDrawerContext.Provider value={value}>{children}</CartDrawerContext.Provider>;
}
