"use client";

import { Button } from "@/components/atoms/button";
import type { CartActionState } from "@/core/entities/cart";
import { useOptionalCartDrawer } from "@/components/patterns/cart-drawer-context";
import { trackAddToCart, type Ga4Item } from "@/lib/analytics/ecommerce";
import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";

export type AddToCartCopy = {
  addToCart: string;
  adding: string;
  soldOut: string;
  viewCart: string;
};

export type AddToCartAction = (prev: CartActionState, formData: FormData) => Promise<CartActionState>;

type AddToCartButtonProps = {
  action: AddToCartAction;
  variantId: string;
  available: boolean;
  locale: string;
  cartHref: string;
  copy: AddToCartCopy;
  /** When set, fires GA4 `add_to_cart` after a successful cart mutation. */
  currency?: string;
  item?: Ga4Item;
};

const INITIAL_STATE: CartActionState = { status: "idle" };

export function AddToCartButton({
  action,
  variantId,
  available,
  locale,
  cartHref,
  copy,
  currency,
  item,
}: AddToCartButtonProps) {
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);
  const formRef = useRef<HTMLFormElement>(null);
  const drawer = useOptionalCartDrawer();

  const openedSuccessKeyRef = useRef<string | null>(null);
  const trackedSuccessKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (state.status !== "success") return;
    const key = `${state.cart.id}:${state.totalQuantity}`;

    if (currency && item && trackedSuccessKeyRef.current !== key) {
      trackedSuccessKeyRef.current = key;
      const quantity = item.quantity ?? 1;
      const price = item.price ?? 0;
      trackAddToCart({
        currency,
        value: price * quantity,
        items: [{ ...item, quantity }],
      });
    }

    if (!drawer) return;
    if (openedSuccessKeyRef.current === key) return;
    openedSuccessKeyRef.current = key;
    const trigger = formRef.current?.querySelector<HTMLElement>('button[type="submit"]');
    drawer.openWithCart(state.cart, trigger ?? null);
  }, [state, drawer, currency, item]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <input type="hidden" name="variantId" value={variantId} />
      <input type="hidden" name="quantity" value="1" />
      <input type="hidden" name="locale" value={locale} />
      <Button type="submit" className="touch-target w-full sm:w-auto" disabled={!available || pending}>
        {!available ? copy.soldOut : pending ? copy.adding : copy.addToCart}
      </Button>
      <p role="status" className="min-h-5 text-sm">
        {state.status === "success" ? (
          <span className="text-foreground">
            {state.message}{" "}
            <Link href={cartHref} className="touch-target-text font-medium text-primary underline-offset-4 hover:underline">
              {copy.viewCart}
            </Link>
          </span>
        ) : state.status === "error" ? (
          <span className="text-destructive">{state.message}</span>
        ) : null}
      </p>
    </form>
  );
}
