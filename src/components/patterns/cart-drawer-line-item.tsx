"use client";

import type { CartDrawerLineActions } from "@/components/patterns/cart-drawer-line-actions";
import type { AppLocale } from "@/constants/i18n";
import { CART_MAX_QUANTITY, type CartSnapshot, type CartSnapshotLine } from "@/core/entities/cart";
import { cn } from "@/lib/cn";
import { productPagePath } from "@/lib/datocms/product-page-path";
import type { CartDrawerCopy } from "@/lib/i18n/cart-drawer-copy";
import { formatStorefrontMoney } from "@/lib/shopify/format-money";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

type CartDrawerLineItemProps = {
  line: CartSnapshotLine;
  locale: AppLocale;
  copy: CartDrawerCopy;
  lineActions: CartDrawerLineActions;
  onApplySnapshot: (snapshot: CartSnapshot) => void;
  onNavigateProduct: () => void;
};

export function CartDrawerLineItem({
  line,
  locale,
  copy,
  lineActions,
  onApplySnapshot,
  onNavigateProduct,
}: CartDrawerLineItemProps) {
  const router = useRouter();
  const [updateSnapshot, updateAction, updatePending] = useActionState(lineActions.updateLine, null);
  const [removeSnapshot, removeAction, removePending] = useActionState(lineActions.removeLine, null);
  const pending = updatePending || removePending;

  useEffect(() => {
    const snapshot = updateSnapshot ?? removeSnapshot;
    if (!snapshot) return;
    onApplySnapshot(snapshot);
    router.refresh();
  }, [updateSnapshot, removeSnapshot, onApplySnapshot, router]);

  const decreaseLabel =
    locale === "pt" ? "Diminuir quantidade" : locale === "es" ? "Disminuir cantidad" : "Decrease quantity";
  const increaseLabel =
    locale === "pt" ? "Aumentar quantidade" : locale === "es" ? "Aumentar cantidad" : "Increase quantity";

  return (
    <li
      className={cn(
        "flex gap-3.5 border-b border-border py-4 transition-opacity last:border-b-0 last:pb-0",
        pending && "opacity-50 pointer-events-none",
      )}
      aria-busy={pending}
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
        {line.image?.url ? (
          <Image
            src={line.image.url}
            alt={line.image.alt}
            width={80}
            height={80}
            sizes="80px"
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <Link
              href={productPagePath(locale, line.productHandle)}
              className="line-clamp-2 text-sm font-medium leading-snug text-foreground underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              onClick={onNavigateProduct}
            >
              {line.productTitle}
            </Link>
            <form action={removeAction} className="shrink-0">
              <input type="hidden" name="lineId" value={line.id} />
              <input type="hidden" name="locale" value={locale} />
              <button
                type="submit"
                disabled={pending}
                aria-label={`${copy.remove} ${line.productTitle}`}
                title={copy.remove}
                className="touch-target -mr-1.5 -mt-1 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-destructive focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-40"
              >
                <svg
                  aria-hidden
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </button>
            </form>
          </div>
          {line.variantTitle ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{line.variantTitle}</p>
          ) : (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatStorefrontMoney(locale, line.unitPrice.amount, line.unitPrice.currencyCode)} {copy.each}
            </p>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <form
            action={updateAction}
            className="inline-flex items-center rounded-lg border border-border bg-background shadow-xs"
          >
            <input type="hidden" name="lineId" value={line.id} />
            <input type="hidden" name="locale" value={locale} />
            <button
              type="submit"
              name="quantity"
              value={line.quantity - 1}
              disabled={pending || line.quantity <= 1}
              aria-label={`${decreaseLabel}: ${line.productTitle}`}
              className="flex h-7 w-7 items-center justify-center rounded-l-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
            >
              <svg
                className="h-3 w-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <span
              className="min-w-7 px-1 text-center text-xs font-semibold tabular-nums text-foreground"
              aria-live="polite"
            >
              {line.quantity}
            </span>
            <button
              type="submit"
              name="quantity"
              value={line.quantity + 1}
              disabled={pending || line.quantity >= CART_MAX_QUANTITY}
              aria-label={`${increaseLabel}: ${line.productTitle}`}
              className="flex h-7 w-7 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
            >
              <svg
                className="h-3 w-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </form>

          <p className="text-sm font-semibold text-foreground">
            {formatStorefrontMoney(locale, line.total.amount, line.total.currencyCode)}
          </p>
        </div>
      </div>
    </li>
  );
}
