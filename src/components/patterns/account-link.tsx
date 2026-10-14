import { IconButton } from "@/components/atoms/icon-button";
import type { AppLocale } from "@/constants/i18n";
import { accountPath } from "@/lib/shopify/customer-session";
import Link from "next/link";

type AccountLinkProps = {
  locale: AppLocale;
  /** From the presence of the `nd-customer` cookie only — no network call in the layout. */
  signedIn: boolean;
  /** Accessible name, e.g. "My account" / "Sign in". */
  label: string;
};

export function AccountLink({ locale, signedIn, label }: AccountLinkProps) {
  return (
    <IconButton asChild className="relative inline-flex items-center justify-center border-border bg-muted hover:bg-muted/80">
      <Link href={accountPath(locale)}>
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
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
        {signedIn ? (
          <span aria-hidden className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" />
        ) : null}
      </Link>
    </IconButton>
  );
}
