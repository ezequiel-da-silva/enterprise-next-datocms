import { IconButton } from "@/components/atoms/icon-button";
import type { AppLocale } from "@/constants/i18n";
import { cn } from "@/lib/cn";
import { accountPath } from "@/lib/shopify/customer-session";
import Link from "next/link";

type AccountLinkProps = {
  locale: AppLocale;
  /** From the presence of the `nd-customer` cookie only — no network call in the layout. */
  signedIn: boolean;
  /** Accessible name, e.g. "My account" / "Sign in". */
  label: string;
  variant?: "icon" | "menu-row";
  className?: string;
};

function AccountIcon({ signedIn }: { signedIn: boolean }) {
  return (
    <>
      <svg
        aria-hidden
        className="h-5 w-5 shrink-0"
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
    </>
  );
}

export function AccountLink({ locale, signedIn, label, variant = "icon", className }: AccountLinkProps) {
  const href = accountPath(locale);

  if (variant === "menu-row") {
    return (
      <Link
        href={href}
        className={cn(
          "touch-target-text relative inline-flex w-full items-center gap-3 rounded-md text-sm font-medium text-foreground transition hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          className,
        )}
      >
        <AccountIcon signedIn={signedIn} />
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <IconButton
      asChild
      className={cn("relative inline-flex items-center justify-center border-border bg-muted hover:bg-muted/80", className)}
    >
      <Link href={href}>
        <span className="sr-only">{label}</span>
        <AccountIcon signedIn={signedIn} />
      </Link>
    </IconButton>
  );
}
