"use client";

import { CartIcon } from "@/components/atoms/cart-icon";
import { IconButton } from "@/components/atoms/icon-button";
import { useCartDrawer } from "@/components/patterns/cart-drawer-context";
import type { AppLocale } from "@/constants/i18n";
import { useRef } from "react";

type CartHeaderButtonProps = {
  locale: AppLocale;
  count: number;
  label: string;
};

export function CartHeaderButton({ count, label }: CartHeaderButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { openFromServer } = useCartDrawer();

  return (
    <IconButton
      ref={buttonRef}
      type="button"
      className="relative inline-flex items-center justify-center border-border bg-muted hover:bg-muted/80"
      aria-label={label}
      onClick={() => void openFromServer(buttonRef.current)}
    >
      <CartIcon />
      {count > 0 ? (
        <span
          aria-hidden
          className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground"
        >
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </IconButton>
  );
}
