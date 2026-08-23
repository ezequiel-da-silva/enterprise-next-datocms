import { Container } from "@/components/atoms/container";
import type { AppLocale } from "@/constants/i18n";
import type { StatCardBlockRecord, StatsSectionBlockRecord } from "@/infra/datocms/types-page";
import { readCdaArray, readCdaString } from "@/lib/datocms/cda-field";
import { cmsBlockAttrs } from "@/lib/datocms/cms-block-attrs";
import { cn } from "@/lib/cn";

type StatsSectionBlockProps = {
  record: StatsSectionBlockRecord;
  locale: AppLocale;
};

/** Espelha a validação do campo `stats` no CMS (entre 1 e 4 blocos). */
const MAX_STATS = 4;

type ParsedStat = {
  id: string;
  value: string;
  label: string;
  description: string;
};

const FALLBACK_SECTION_LABEL: Record<AppLocale, string> = {
  en: "Statistics",
  pt: "Estatísticas",
  es: "Estadísticas",
};

function readStats(record: StatsSectionBlockRecord): ParsedStat[] {
  const raw =
    record.stats ?? readCdaArray<StatCardBlockRecord>(record as Record<string, unknown>, "stats", "stats");

  const parsed: ParsedStat[] = [];
  for (const item of raw) {
    if (!item?.id || item.__typename !== "StatCardRecord") continue;
    const value = readCdaString(item as Record<string, unknown>, "value", "value");
    const label = readCdaString(item as Record<string, unknown>, "label", "label");
    if (!value || !label) continue;
    parsed.push({
      id: item.id,
      value,
      label,
      description: readCdaString(item as Record<string, unknown>, "description", "description"),
    });
    if (parsed.length >= MAX_STATS) break;
  }
  return parsed;
}

/** 1 a 4 cards: nunca deixar colunas vazias nem espremer 4 métricas em ecrãs médios. */
function statsGridClass(count: number): string {
  if (count <= 1) return "mx-auto max-w-xl grid-cols-1";
  if (count === 2) return "mx-auto max-w-3xl grid-cols-1 sm:grid-cols-2";
  if (count === 3) return "grid-cols-1 md:grid-cols-3";
  return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
}

function StatCard({ stat }: { stat: ParsedStat }) {
  return (
    <div
      className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 text-center text-card-foreground shadow-sm"
    >
      {/* Valor visual primeiro; DOM mantém dt → dd para leitores de ecrã. */}
      <dt className="order-2 mt-2 text-sm font-medium text-muted-foreground">{stat.label}</dt>
      <dd className="order-1 text-4xl font-extrabold tracking-tight text-primary sm:text-5xl">{stat.value}</dd>
      {stat.description ? (
        <dd className="order-3 mt-2 text-sm leading-relaxed text-muted-foreground">{stat.description}</dd>
      ) : null}
    </div>
  );
}

export function StatsSectionBlock({ record, locale }: StatsSectionBlockProps) {
  const title = readCdaString(record as Record<string, unknown>, "title", "title");
  const subtitle = readCdaString(record as Record<string, unknown>, "subtitle", "subtitle");
  const stats = readStats(record);
  if (stats.length === 0) return null;

  const headingId = `stats-section-${record.id}`;

  return (
    <section
      {...cmsBlockAttrs(record)}
      data-datocms-content-link-boundary=""
      className="not-prose my-12 w-full py-6"
      {...(title
        ? { "aria-labelledby": headingId }
        : { "aria-label": FALLBACK_SECTION_LABEL[locale] })}
    >
      <Container size="lg" name="StatsSection" className="flex flex-col gap-10">
        {title || subtitle ? (
          <header className="mx-auto max-w-3xl text-center">
            {title ? (
              <h2 id={headingId} className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p className={cn("text-base text-muted-foreground", title && "mt-2")}>{subtitle}</p>
            ) : null}
          </header>
        ) : null}

        <dl className={cn("m-0 grid list-none gap-6 p-0", statsGridClass(stats.length))}>
          {stats.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </dl>
      </Container>
    </section>
  );
}
