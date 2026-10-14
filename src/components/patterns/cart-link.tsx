import { IconButton } from "@/components/atoms/icon-button";
import type { AppLocale } from "@/constants/i18n";
import { cartPath } from "@/lib/shopify/cart-cookie";
import Link from "next/link";

type CartLinkProps = {
  locale: AppLocale;
  count: number;
  /** Accessible name, e.g. "Cart, 2 items". */
  label: string;
};

export function CartLink({ locale, count, label }: CartLinkProps) {
  return (
    <IconButton asChild className="relative inline-flex items-center justify-center border-border bg-muted hover:bg-muted/80">
      <Link href={cartPath(locale)}>
        <span className="sr-only">{label}</span>
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
      </Link>
    </IconButton>
  );
}
