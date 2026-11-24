import { PaymentMethodBadges } from "@/components/patterns/payment-method-badges";
import type { AppLocale } from "@/constants/i18n";

type CheckoutTrustStripProps = {
  locale: AppLocale;
  /** Accessible name for the payment methods list. */
  paymentsLabel: string;
  /** Calming secure-checkout microcopy under the badges. */
  secureNote: string;
};

/** Compact payment seals + trust line for use under primary checkout / ATC CTAs. */
export function CheckoutTrustStrip({ locale, paymentsLabel, secureNote }: CheckoutTrustStripProps) {
  const note = secureNote.trim();
  return (
    <div className="space-y-2" data-ui-section="CheckoutTrustStrip">
      <PaymentMethodBadges locale={locale} label={paymentsLabel} />
      {note ? <p className="text-xs text-muted-foreground">{note}</p> : null}
    </div>
  );
}
