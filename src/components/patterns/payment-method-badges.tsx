import type { AppLocale } from "@/constants/i18n";

type PaymentMethodBadgesProps = {
  locale: AppLocale;
  label: string;
  showPix?: boolean;
};

const BADGE_CLASS =
  "inline-flex h-6 items-center justify-center rounded border border-border/80 bg-background px-1.5 text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground";

/** Monochrome payment cues for the footer trust bar (no external assets). */
export function PaymentMethodBadges({ locale, label, showPix = locale === "pt" }: PaymentMethodBadgesProps) {
  const methods = ["Visa", "Mastercard", "Amex", "Apple Pay", "Google Pay", ...(showPix ? ["PIX"] : [])];

  return (
    <ul className="flex flex-wrap items-center gap-1.5" aria-label={label}>
      {methods.map((method) => (
        <li key={method}>
          <span className={BADGE_CLASS} aria-hidden>
            {method === "Mastercard"
              ? "MC"
              : method === "Apple Pay"
                ? "APay"
                : method === "Google Pay"
                  ? "GPay"
                  : method}
          </span>
          <span className="sr-only">{method}</span>
        </li>
      ))}
    </ul>
  );
}

export function paymentMethodsForLocale(locale: AppLocale): string[] {
  return ["Visa", "Mastercard", "Amex", "Apple Pay", "Google Pay", ...(locale === "pt" ? ["PIX"] : [])];
}
