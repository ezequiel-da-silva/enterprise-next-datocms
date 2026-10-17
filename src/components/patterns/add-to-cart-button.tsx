"use client";

import { Button } from "@/components/atoms/button";
import type { CartActionState } from "@/core/entities/cart";
import { useOptionalCartDrawer } from "@/components/patterns/cart-drawer-context";
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
};

const INITIAL_STATE: CartActionState = { status: "idle" };

export function AddToCartButton({ action, variantId, available, locale, cartHref, copy }: AddToCartButtonProps) {
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);
  const formRef = useRef<HTMLFormElement>(null);
  const drawer = useOptionalCartDrawer();

  useEffect(() => {
    if (state.status === "success" && drawer) {
      const trigger = formRef.current?.querySelector<HTMLElement>('button[type="submit"]');
      drawer.openWithCart(state.cart, trigger ?? null);
    }
  }, [state, drawer]);

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
