"use client";

import { IconButton } from "@/components/atoms/icon-button";
import { useWishlist } from "@/components/patterns/wishlist-provider";
import type { AppLocale } from "@/constants/i18n";
import { wishlistCopy } from "@/lib/i18n/wishlist-copy";
import { cn } from "@/lib/cn";
import type { WishlistItem } from "@/lib/wishlist/types";
import type { MouseEvent } from "react";

type WishlistToggleButtonProps = {
  locale: AppLocale;
  item: Omit<WishlistItem, "savedAt">;
  className?: string;
  /**
   * Catalog cards: visible on touch; on `md+` hide until card `:hover` / `:focus-within`,
   * unless the item is already wishlisted (recognition).
   */
  revealOnCardHover?: boolean;
};

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19.5 12.6 12 20l-7.5-7.4a4.6 4.6 0 0 1 0-6.6 4.7 4.7 0 0 1 6.6 0l.9.9.9-.9a4.7 4.7 0 0 1 6.6 0 4.6 4.6 0 0 1 0 6.6z" />
    </svg>
  );
}

export function WishlistToggleButton({
  locale,
  item,
  className,
  revealOnCardHover = false,
}: WishlistToggleButtonProps) {
  const copy = wishlistCopy(locale);
  const { has, toggle, ready } = useWishlist();
  const pressed = ready && has(item.handle);

  function onClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    toggle(item);
  }

  return (
    <IconButton
      type="button"
      className={cn(
        "rounded-lg border border-border bg-background/95 text-foreground shadow-none",
        pressed ? "text-primary" : "text-muted-foreground hover:text-foreground",
        revealOnCardHover &&
          "opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100",
        revealOnCardHover && pressed && "md:opacity-100",
        className,
      )}
      aria-label={pressed ? copy.remove : copy.add}
      aria-pressed={pressed}
      onClick={onClick}
    >
      <HeartIcon filled={pressed} />
    </IconButton>
  );
}
