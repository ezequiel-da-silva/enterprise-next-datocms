import { Container } from "@/components/atoms/container";
import { PricingCard } from "@/components/molecules/pricing-card";
import type { AppLocale } from "@/constants/i18n";
import type { PricingCardBlockRecord, PricingSectionBlockRecord } from "@/infra/datocms/types-page";
import { readCdaArray, readCdaBool, readCdaString } from "@/lib/datocms/cda-field";
import { cmsBlockAttrs } from "@/lib/datocms/cms-block-attrs";
import { cn } from "@/lib/cn";

type PricingSectionBlockProps = {
  record: PricingSectionBlockRecord;
  locale: AppLocale;
};

function readPlans(record: PricingSectionBlockRecord): PricingCardBlockRecord[] {
  const raw = record.plans ?? readCdaArray<PricingCardBlockRecord>(record as Record<string, unknown>, "plans", "plans");
  return raw
    .filter((plan): plan is PricingCardBlockRecord => Boolean(plan?.id) && plan.__typename === "PricingCardRecord")
    .slice(0, 4);
}

/**
 * Linhas partilhadas pelos cards (CSS subgrid): badge · nome+descrição · preço · features · CTA.
 * Cada card ocupa a faixa inteira, por isso nome, preço e features alinham entre cards mesmo
 * com descrições de tamanhos diferentes. Só é preciso declarar as linhas nos breakpoints com
 * várias colunas — numa coluna cada card é a sua própria faixa (linhas implícitas `auto`).
 * A linha da badge só existe se algum plano for `is_popular` (senão sobrava um vão no topo).
 */
function plansGridClass(count: number, hasPopular: boolean): string {
  if (count <= 1) {
    return "mx-auto max-w-xl grid-cols-1";
  }
  if (count === 2) {
    return cn(
      "mx-auto max-w-3xl grid-cols-1 sm:grid-cols-2",
      hasPopular ? "sm:grid-rows-[auto_auto_auto_1fr_auto]" : "sm:grid-rows-[auto_auto_1fr_auto]",
    );
  }
  if (count === 3) {
    return cn(
      "grid-cols-1 md:grid-cols-3",
      hasPopular ? "md:grid-rows-[auto_auto_auto_1fr_auto]" : "md:grid-rows-[auto_auto_1fr_auto]",
    );
  }
  return cn(
    "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    hasPopular
      ? "sm:grid-rows-[repeat(2,auto_auto_auto_1fr_auto)] lg:grid-rows-[auto_auto_auto_1fr_auto]"
      : "sm:grid-rows-[repeat(2,auto_auto_1fr_auto)] lg:grid-rows-[auto_auto_1fr_auto]",
  );
}

export function PricingSectionBlock({ record, locale }: PricingSectionBlockProps) {
  const title = readCdaString(record as Record<string, unknown>, "title", "title");
  if (!title) return null;

  const subtitle = readCdaString(record as Record<string, unknown>, "subtitle", "subtitle");
  const plans = readPlans(record);
  if (plans.length === 0) return null;

  const headingId = `pricing-section-${record.id}`;
  const hasPopular = plans.some((plan) => readCdaBool(plan as Record<string, unknown>, "isPopular", "is_popular"));

  return (
    <section
      {...cmsBlockAttrs(record)}
      data-datocms-content-link-boundary=""
      className="not-prose my-12 w-full py-6"
      aria-labelledby={headingId}
    >
      <Container size="lg" name="PricingSection" className="flex flex-col gap-10">
        <header className="mx-auto max-w-3xl text-center">
          <h2 id={headingId} className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h2>
          {subtitle ? <p className="mt-2 text-base text-muted-foreground">{subtitle}</p> : null}
        </header>

        <ul className={cn("m-0 grid list-none gap-6 p-0", plansGridClass(plans.length, hasPopular))}>
          {plans.map((plan) => (
            <li
              key={plan.id}
              className={cn("grid min-w-0 grid-rows-subgrid", hasPopular ? "row-span-5" : "row-span-4")}
            >
              <PricingCard plan={plan} locale={locale} reserveBadgeRow={hasPopular} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
