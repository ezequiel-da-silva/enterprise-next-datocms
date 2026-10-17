"use client";

import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import type { CartDrawerLineActions } from "@/components/patterns/cart-drawer-line-actions";
import type { AppLocale } from "@/constants/i18n";
import { CART_MAX_QUANTITY, type CartSnapshotLine } from "@/core/entities/cart";
import { productPagePath } from "@/lib/datocms/product-page-path";
import type { CartDrawerCopy } from "@/lib/i18n/cart-drawer-copy";
import { formatStorefrontMoney } from "@/lib/shopify/format-money";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

type SyncCartAfterSubmitProps = {
  syncCart: () => Promise<void>;
};

function SyncCartAfterSubmit({ syncCart }: SyncCartAfterSubmitProps) {
  const { pending } = useFormStatus();
  const router = useRouter();
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending) {
      void (async () => {
        await syncCart();
        router.refresh();
      })();
    }
    wasPending.current = pending;
  }, [pending, syncCart, router]);

  return null;
}

type CartDrawerLineItemProps = {
  line: CartSnapshotLine;
  locale: AppLocale;
  copy: CartDrawerCopy;
  lineActions: CartDrawerLineActions;
  syncCart: () => Promise<void>;
  onNavigateProduct: () => void;
};

export function CartDrawerLineItem({
  line,
  locale,
  copy,
  lineActions,
  syncCart,
  onNavigateProduct,
}: CartDrawerLineItemProps) {
  const quantityId = `drawer-cart-qty-${line.id.replace(/\W/g, "")}`;

  return (
    <li className="flex flex-col gap-3 border-b border-border pb-4 last:border-b-0 last:pb-0">
      <div className="flex gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
          {line.image?.url ? (
            <Image
              src={line.image.url}
              alt={line.image.alt}
              width={64}
              height={64}
              sizes="64px"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <Link
              href={productPagePath(locale, line.productHandle)}
              className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              onClick={onNavigateProduct}
            >
              {line.productTitle}
            </Link>
            <p className="shrink-0 text-sm font-semibold text-foreground">
              {formatStorefrontMoney(locale, line.total.amount, line.total.currencyCode)}
            </p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatStorefrontMoney(locale, line.unitPrice.amount, line.unitPrice.currencyCode)} {copy.each}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pl-[4.75rem]">
        <form action={lineActions.updateLine} className="flex items-center gap-2">
          <input type="hidden" name="lineId" value={line.id} />
          <input type="hidden" name="locale" value={locale} />
          <label htmlFor={quantityId} className="text-sm text-muted-foreground">
            {copy.quantity}
          </label>
          <Input
            id={quantityId}
            name="quantity"
            type="number"
            inputMode="numeric"
            min={0}
            max={CART_MAX_QUANTITY}
            defaultValue={line.quantity}
            className="w-16 text-center"
          />
          <UpdateButton label={copy.update} />
          <SyncCartAfterSubmit syncCart={syncCart} />
        </form>
        <form action={lineActions.removeLine}>
          <input type="hidden" name="lineId" value={line.id} />
          <input type="hidden" name="locale" value={locale} />
          <RemoveButton label={copy.remove} />
          <SyncCartAfterSubmit syncCart={syncCart} />
        </form>
      </div>
    </li>
  );
}

function UpdateButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" className="touch-target" disabled={pending} aria-busy={pending}>
      {label}
    </Button>
  );
}

function RemoveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="ghost"
      className="touch-target text-muted-foreground hover:text-destructive"
      disabled={pending}
      aria-busy={pending}
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
        <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
      </svg>
      {label}
    </Button>
  );
}
