"use client";

import { Button, type ButtonProps } from "@/components/atoms/button";
import { cartBeginCheckoutPayload, type CartBeginCheckoutSource } from "@/lib/analytics/cart-begin-checkout";
import { trackBeginCheckout } from "@/lib/analytics/ecommerce";

type CartCheckoutLinkProps = {
  checkoutUrl: string;
  label: string;
  cart: CartBeginCheckoutSource;
  className?: string;
  variant?: ButtonProps["variant"];
};

/** Checkout CTA that fires GA4 `begin_checkout` before navigating to Shopify. */
export function CartCheckoutLink({
  checkoutUrl,
  label,
  cart,
  className,
  variant = "primary",
}: CartCheckoutLinkProps) {
  return (
    <Button asChild variant={variant} className={className}>
      <a
        href={checkoutUrl}
        rel="noopener noreferrer"
        onClick={() => {
          const payload = cartBeginCheckoutPayload(cart);
          if (payload) trackBeginCheckout(payload);
        }}
      >
        {label}
      </a>
    </Button>
  );
}
