"use client";

import { Button } from "@/components/atoms/button";
import { CartDrawerLineItem } from "@/components/patterns/cart-drawer-line-item";
import { useCartDrawer } from "@/components/patterns/cart-drawer-context";
import { useModalDialog } from "@/lib/a11y/use-modal-dialog";
import { formatStorefrontMoney } from "@/lib/shopify/format-money";
import Link from "next/link";
import { useId, useRef } from "react";
import { createPortal } from "react-dom";

export function CartDrawer() {
  const { open, cart, locale, copy, cartHref, lineActions, close, returnFocusRef, applyCartSnapshot } =
    useCartDrawer();
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useModalDialog({
    open,
    panelRef,
    returnFocusRef,
    onClose: close,
  });

  if (!open || typeof document === "undefined") return null;

  const subtotal = cart?.subtotal;
  const checkoutUrl = cart?.checkoutUrl;

  return createPortal(
    <div className="fixed inset-0 z-[70]" role="presentation">
      <button
        type="button"
        className="absolute inset-0 cursor-pointer bg-foreground/40 backdrop-blur-sm"
        aria-label={copy.closeDrawer}
        onClick={close}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-ui-section="CartDrawer"
        className="absolute right-0 top-0 flex h-full w-[min(100%,24rem)] flex-col border-l border-border bg-background shadow-xl"
      >
        <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
          <h2 id={titleId} className="text-base font-semibold text-foreground">
            {copy.title}
          </h2>
          <button
            type="button"
            className="touch-target cursor-pointer rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            onClick={close}
          >
            <span className="sr-only">{copy.closeDrawer}</span>
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
          {!cart || cart.lines.length === 0 ? (
            <p className="text-muted-foreground">{copy.empty}</p>
          ) : (
            <ul className="space-y-4">
              {cart.lines.map((line) => (
                <CartDrawerLineItem
                  key={line.id}
                  line={line}
                  locale={locale}
                  copy={copy}
                  lineActions={lineActions}
                  onApplySnapshot={applyCartSnapshot}
                  onNavigateProduct={close}
                />
              ))}
            </ul>
          )}
        </div>

        <footer className="space-y-3 border-t border-border px-4 py-4">
          {subtotal ? (
            <p className="flex justify-between text-sm font-medium text-foreground">
              <span>{copy.subtotal}</span>
              <span>{formatStorefrontMoney(locale, subtotal.amount, subtotal.currencyCode)}</span>
            </p>
          ) : null}
          {checkoutUrl ? (
            <Button asChild variant="primary" className="w-full">
              <a href={checkoutUrl} rel="noopener noreferrer">
                {copy.checkout}
              </a>
            </Button>
          ) : (
            <Button type="button" variant="primary" className="w-full" disabled>
              {copy.checkoutUnavailable}
            </Button>
          )}
          <Link
            href={cartHref}
            className="touch-target-text block text-center text-sm font-medium text-primary underline-offset-4 hover:underline"
            onClick={close}
          >
            {copy.viewCart}
          </Link>
          <p className="text-center text-xs text-muted-foreground">{copy.checkoutNote}</p>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
