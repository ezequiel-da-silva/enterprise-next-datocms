"use client";

import { IconButton } from "@/components/atoms/icon-button";
import { useWishlist } from "@/components/patterns/wishlist-provider";
import type { AppLocale } from "@/constants/i18n";
import { wishlistCopy, wishlistPath } from "@/lib/i18n/wishlist-copy";
import Link from "next/link";

type WishlistHeaderButtonProps = {
  locale: AppLocale;
};

function HeartIcon() {
  return (
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
      <path d="M19.5 12.6 12 20l-7.5-7.4a4.6 4.6 0 0 1 0-6.6 4.7 4.7 0 0 1 6.6 0l.9.9.9-.9a4.7 4.7 0 0 1 6.6 0 4.6 4.6 0 0 1 0 6.6z" />
    </svg>
  );
}

export function WishlistHeaderButton({ locale }: WishlistHeaderButtonProps) {
  const copy = wishlistCopy(locale);
  const { count, ready } = useWishlist();
  const badge = ready ? count : 0;

  return (
    <IconButton
      asChild
      className="relative inline-flex items-center justify-center border-border bg-muted hover:bg-muted/80"
    >
      <Link href={wishlistPath(locale)} aria-label={copy.linkLabel(badge)}>
        <HeartIcon />
        {!ready ? (
          <span
            aria-hidden
            className="invisible absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-semibold"
          />
        ) : count > 0 ? (
          <span
            aria-hidden
            className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground"
          >
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </Link>
    </IconButton>
  );
}
