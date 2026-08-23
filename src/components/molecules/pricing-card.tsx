import { Button } from "@/components/atoms/button";
import { SmartLink } from "@/components/patterns/smart-link";
import type { AppLocale } from "@/constants/i18n";
import type { PricingCardBlockRecord } from "@/infra/datocms/types-page";
import { readCdaBlock, readCdaBool, readCdaString } from "@/lib/datocms/cda-field";
import { resolveLinkBlock } from "@/lib/datocms/link-block";
import {
  formatBillingPeriod,
  formatPriceLabel,
  parseAmount,
  parseBillingPeriod,
  parseCurrency,
  parsePriceType,
  parsePricingFeatures,
  popularBadgeLabel,
} from "@/lib/datocms/pricing-format";
import { cn } from "@/lib/cn";

type PricingCardProps = {
  plan: PricingCardBlockRecord;
  locale: AppLocale;
  /**
   * Reserva a linha da badge em todos os cards da secção (mesmo sem `is_popular`),
   * para os nomes e preços ficarem à mesma altura. Ver `pricing-section-block.tsx`.
   */
  reserveBadgeRow?: boolean;
};

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden>
      <path
        fill="currentColor"
        d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0l-3.5-3.5a1 1 0 1 1 1.4-1.4L8.5 12l6.8-6.8a1 1 0 0 1 1.4 0z"
      />
    </svg>
  );
}

export function PricingCard({ plan, locale, reserveBadgeRow = false }: PricingCardProps) {
  const name = readCdaString(plan as Record<string, unknown>, "name", "name");
  if (!name) return null;

  const description = readCdaString(plan as Record<string, unknown>, "description", "description");
  const isPopular = readCdaBool(plan as Record<string, unknown>, "isPopular", "is_popular");
  const hasButton = readCdaBool(plan as Record<string, unknown>, "hasButton", "has_button");
  const priceType = parsePriceType(readCdaString(plan as Record<string, unknown>, "priceType", "price_type"));
  const currency = parseCurrency(readCdaString(plan as Record<string, unknown>, "currency", "currency"));
  const amount = parseAmount(plan.amount);
  const period = parseBillingPeriod(
    readCdaString(plan as Record<string, unknown>, "billingPeriod", "billing_period"),
  );
  const features = parsePricingFeatures(
    readCdaString(plan as Record<string, unknown>, "features", "features"),
  );
  const priceLabel = formatPriceLabel(priceType, amount, currency, locale);
  const periodLabel = priceType === "paid" ? formatBillingPeriod(period, locale) : null;
  const badge = popularBadgeLabel(locale);
  const badgeId = `pricing-popular-${plan.id}`;

  /** `cta_button` chega como lista de 1 item (modular content) no CDA. */
  const cta = hasButton
    ? readCdaBlock<Record<string, unknown>>(plan as Record<string, unknown>, "ctaButton", "cta_button")
    : null;
  const resolvedCta = cta && resolveLinkBlock(cta, locale) ? cta : null;

  return (
    <article
      className={cn(
        "grid grid-rows-subgrid rounded-2xl border bg-card p-6 text-card-foreground shadow-sm",
        reserveBadgeRow ? "row-span-5" : "row-span-4",
        isPopular ? "border-primary ring-2 ring-primary/30" : "border-border",
      )}
      aria-labelledby={`pricing-plan-${plan.id}`}
      aria-describedby={isPopular ? badgeId : undefined}
    >
      {reserveBadgeRow ? (
        isPopular ? (
          <p
            id={badgeId}
            className="inline-flex w-fit self-start rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-primary-foreground"
          >
            {badge}
          </p>
        ) : (
          <div />
        )
      ) : null}

      <header>
        <h3 id={`pricing-plan-${plan.id}`} className="text-xl font-semibold tracking-tight text-foreground">
          {name}
        </h3>
        {description ? <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
      </header>

      <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 self-start">
        <span className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">{priceLabel}</span>
        {periodLabel ? <span className="text-sm text-muted-foreground">{periodLabel}</span> : null}
      </p>

      {features.length > 0 ? (
        <ul className="flex flex-col gap-2.5 self-start">
          {features.map((feature) => (
            <li key={feature} className="flex gap-2 text-sm leading-relaxed text-foreground">
              <CheckIcon />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div />
      )}

      {resolvedCta ? (
        <div className="self-end">
          <Button
            asChild
            variant={isPopular ? "primary" : "outline"}
            /*
             * `border-border` sobre a superfície do card quase não se vê no tema escuro
             * (ambos ~L9-17%): borda e hover em `foreground` com alfa adaptam-se aos dois temas.
             */
            className={cn("min-h-12 w-full", !isPopular && "border-foreground/50 hover:bg-foreground/10")}
          >
            <SmartLink record={resolvedCta} locale={locale} tone="inherit" />
          </Button>
        </div>
      ) : (
        <div />
      )}
    </article>
  );
}
