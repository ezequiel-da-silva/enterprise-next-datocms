"use client";

import { Button } from "@/components/atoms/button";
import type { BuyNowActionState } from "@/core/entities/cart";
import { trackBeginCheckout } from "@/lib/analytics/ecommerce";
import { useActionState, useEffect, useRef } from "react";

export type BuyNowCopy = {
  buyNow: string;
  buying: string;
  soldOut: string;
};

export type BuyNowAction = (prev: BuyNowActionState, formData: FormData) => Promise<BuyNowActionState>;

type BuyNowButtonProps = {
  action: BuyNowAction;
  variantId: string;
  available: boolean;
  locale: string;
  copy: BuyNowCopy;
};

const INITIAL_STATE: BuyNowActionState = { status: "idle" };

export function BuyNowButton({ action, variantId, available, locale, copy }: BuyNowButtonProps) {
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);
  const redirectedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (state.status !== "success") return;
    const key = state.checkoutUrl;
    if (redirectedKeyRef.current === key) return;
    redirectedKeyRef.current = key;
    trackBeginCheckout({
      currency: state.currency,
      value: state.value,
      items: state.items,
    });
    window.location.assign(state.checkoutUrl);
  }, [state]);

  return (
    <form action={formAction} className="w-full sm:w-auto">
      <input type="hidden" name="variantId" value={variantId} />
      <input type="hidden" name="quantity" value="1" />
      <input type="hidden" name="locale" value={locale} />
      <Button
        type="submit"
        variant="outline"
        className="touch-target w-full sm:w-auto"
        disabled={!available || pending}
      >
        {!available ? copy.soldOut : pending ? copy.buying : copy.buyNow}
      </Button>
      {state.status === "error" ? (
        <p role="status" className="mt-2 min-h-5 text-sm text-destructive">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
