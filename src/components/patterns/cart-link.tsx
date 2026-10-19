import { CartIcon } from "@/components/atoms/cart-icon";
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
        <CartIcon />
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
