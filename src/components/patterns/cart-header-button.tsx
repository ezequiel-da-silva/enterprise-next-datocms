"use client";

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
      <svg
        aria-hidden
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 7h12l-1 13H7L6 7Z" />
        <path d="M9 7a3 3 0 0 1 6 0" />
      </svg>
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
