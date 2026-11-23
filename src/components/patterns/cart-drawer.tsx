"use client";

import { Button } from "@/components/atoms/button";
import { CartDrawerLineItem } from "@/components/patterns/cart-drawer-line-item";
import { useCartDrawer } from "@/components/patterns/cart-drawer-context";
import { RecentlyViewedSection } from "@/components/patterns/recently-viewed-section";
import { trackBeginCheckout } from "@/lib/analytics/ecommerce";
import { useModalDialog } from "@/lib/a11y/use-modal-dialog";
import { resolveFreeShippingRemaining } from "@/lib/i18n/cart-copy";
import { computeFreeShippingProgress } from "@/lib/shopify/free-shipping-progress";
import { formatStorefrontMoney } from "@/lib/shopify/format-money";
import Link from "next/link";
import { useId, useRef } from "react";
import { createPortal } from "react-dom";

export function CartDrawer() {
  const {
    open,
    cart,
    locale,
    copy,
    trustNote,
    freeShippingThreshold,
    marketCurrencyCode,
    shippingRate,
    cartHref,
    lineActions,
    close,
    returnFocusRef,
    applyCartSnapshot,
  } = useCartDrawer();
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
  const subtotalAmount = subtotal ? Number(subtotal.amount) : NaN;
  const currencyOk = Boolean(
    subtotal &&
      marketCurrencyCode &&
      subtotal.currencyCode.trim().toUpperCase() === marketCurrencyCode.trim().toUpperCase(),
  );
  const shippingProgress = computeFreeShippingProgress({
    subtotal: Number.isFinite(subtotalAmount) ? subtotalAmount : 0,
    threshold: freeShippingThreshold,
    currencyOk,
    shippingRate,
  });
  const progressLabel =
    shippingProgress.kind === "progress"
      ? shippingProgress.unlocked
        ? copy.freeShippingUnlocked
        : resolveFreeShippingRemaining(
            copy.freeShippingRemainingTemplate,
            formatStorefrontMoney(
              locale,
              shippingProgress.remaining.toFixed(2),
              subtotal?.currencyCode ?? marketCurrencyCode ?? "USD",
            ),
          )
      : null;

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
        <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <h2 id={titleId} className="text-base font-semibold text-foreground">
              {copy.title}
            </h2>
            {cart && cart.totalQuantity > 0 ? (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {cart.totalQuantity} {cart.totalQuantity === 1 ? "item" : locale === "pt" ? "itens" : "items"}
              </span>
            ) : null}
          </div>
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

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4">
          {!cart || cart.lines.length === 0 ? (
            <div className="space-y-6">
              <p className="text-muted-foreground">{copy.empty}</p>
              <RecentlyViewedSection
                locale={locale}
                title={copy.recentlyViewedTitle}
                layout="drawer"
                onProductNavigate={close}
              />
            </div>
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

        <footer className="shrink-0 space-y-3 border-t border-border px-4 py-4">
          {shippingProgress.kind === "progress" && progressLabel ? (
            <div className="space-y-2" data-free-shipping-progress="">
              <p className="text-xs font-medium text-foreground">{progressLabel}</p>
              <div
                className="h-1.5 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(shippingProgress.ratio * 100)}
                aria-label={progressLabel}
              >
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
                  style={{ width: `${Math.round(shippingProgress.ratio * 100)}%` }}
                />
              </div>
            </div>
          ) : null}
          {subtotal ? (
            <p className="flex justify-between text-sm font-medium text-foreground">
              <span>{copy.subtotal}</span>
              <span>{formatStorefrontMoney(locale, subtotal.amount, subtotal.currencyCode)}</span>
            </p>
          ) : null}
          <p className="text-xs text-muted-foreground">{trustNote?.trim() || copy.checkoutNote}</p>
          {checkoutUrl ? (
            <Button asChild variant="primary" className="w-full">
              <a
                href={checkoutUrl}
                rel="noopener noreferrer"
                onClick={() => {
                  if (!cart?.subtotal) return;
                  trackBeginCheckout({
                    currency: cart.subtotal.currencyCode,
                    value: Number(cart.subtotal.amount) || 0,
                    items: cart.lines.map((line) => ({
                      item_id: line.productHandle,
                      item_name: line.productTitle,
                      price: Number(line.unitPrice.amount) || 0,
                      quantity: line.quantity,
                      item_variant: line.variantTitle ?? undefined,
                    })),
                  });
                }}
              >
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
        </footer>
      </div>
    </div>,
    document.body,
  );
}
