import { Container } from "@/components/atoms/container";
import { DatoResponsivePicture } from "@/components/patterns/dato-responsive-picture";
import type { AppLocale } from "@/constants/i18n";
import type { FileFieldLike, StepCardBlockRecord, StepsSectionBlockRecord } from "@/infra/datocms/types-page";
import { readCdaArray, readCdaBlock, readCdaBool, readCdaString } from "@/lib/datocms/cda-field";
import { cmsBlockAttrs } from "@/lib/datocms/cms-block-attrs";
import { cn } from "@/lib/cn";

type StepsSectionBlockProps = {
  record: StepsSectionBlockRecord;
  locale: AppLocale;
};

/** Corte defensivo: o CMS não documenta um máximo. */
const MAX_STEPS = 8;

type ImageBlockLike = {
  __typename?: string;
  asset?: FileFieldLike;
  assetDesktop?: FileFieldLike;
};

type ParsedStep = {
  id: string;
  title: string;
  description: string;
  image: ImageBlockLike | null;
};

const FALLBACK_SECTION_LABEL: Record<AppLocale, string> = {
  en: "Steps",
  pt: "Passos",
  es: "Pasos",
};

function readStepImage(card: StepCardBlockRecord): ImageBlockLike | null {
  if (!readCdaBool(card as Record<string, unknown>, "hasImage", "has_image")) return null;
  const block = readCdaBlock<ImageBlockLike>(card as Record<string, unknown>, "mediaImage", "media_image");
  if (!block?.asset?.url?.trim()) return null;
  return block;
}

function readSteps(record: StepsSectionBlockRecord): ParsedStep[] {
  const raw =
    record.steps ?? readCdaArray<StepCardBlockRecord>(record as Record<string, unknown>, "steps", "steps");

  const parsed: ParsedStep[] = [];
  for (const item of raw) {
    if (!item?.id || item.__typename !== "StepCardRecord") continue;
    const title = readCdaString(item as Record<string, unknown>, "title", "title");
    if (!title) continue;
    parsed.push({
      id: item.id,
      title,
      description: readCdaString(item as Record<string, unknown>, "description", "description"),
      image: readStepImage(item),
    });
    if (parsed.length >= MAX_STEPS) break;
  }
  return parsed;
}

function stepsColumnsClass(count: number): string {
  if (count <= 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-1 md:grid-cols-2";
  if (count === 3) return "grid-cols-1 md:grid-cols-3";
  return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
}

/** Largura no wrapper, não no `ol`: as linhas de ligação são absolutas e não podem passar dos cards. */
function stepsWidthClass(count: number): string | null {
  if (count <= 1) return "mx-auto max-w-xl";
  if (count === 2) return "mx-auto max-w-3xl";
  return null;
}

/**
 * Linhas de ligação decorativas: ficam atrás da grelha (`z-0`) e os cards opacos tapam-nas,
 * por isso só aparecem nos vãos entre passos — sem contas de "último da fila" por breakpoint.
 * Vertical enquanto há uma só coluna; horizontal quando todos os passos ficam numa fila.
 */
function connectorVisibility(count: number): { vertical: string | null; horizontal: string | null } {
  if (count < 2) return { vertical: null, horizontal: null };
  if (count <= 3) return { vertical: "md:hidden", horizontal: "hidden md:block" };
  if (count === 4) return { vertical: "sm:hidden", horizontal: "hidden lg:block" };
  /* 5+ passos: sempre várias filas quando há colunas — só liga na vertical (mobile). */
  return { vertical: "sm:hidden", horizontal: null };
}

/** `sizes` acompanha gutters, padding dos cards e o número real de colunas. */
function stepImageSizes(count: number): string {
  const mobile = "(max-width: 639px) calc(100vw - 5rem)";
  if (count <= 1) return `${mobile}, min(calc(100vw - 5rem), 33rem)`;
  if (count === 2) {
    return `(max-width: 767px) calc(100vw - 5rem), calc((min(100vw - 2rem, 48rem) - 7.5rem) / 2)`;
  }
  if (count === 3) {
    return `(max-width: 767px) calc(100vw - 5rem), calc((min(100vw - 2rem, 70rem) - 12rem) / 3)`;
  }
  return `${mobile}, (max-width: 1023px) calc((min(100vw - 2rem, 70rem) - 7.5rem) / 2), calc((min(100vw - 2rem, 70rem) - 16.5rem) / 4)`;
}

function StepCard({ step, index, total }: { step: ParsedStep; index: number; total: number }) {
  const numberLabel = (index + 1).toString().padStart(2, "0");
  const headingId = `step-card-${step.id}`;

  return (
    <li className="relative min-w-0">
      <article
        className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm"
        aria-labelledby={headingId}
      >
        <span
          aria-hidden
          className="relative z-10 mb-4 inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold tabular-nums text-primary-foreground"
        >
          {numberLabel}
        </span>
        <h3 id={headingId} className="text-lg font-semibold tracking-tight text-card-foreground">
          {step.title}
        </h3>
        {step.description ? (
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{step.description}</p>
        ) : null}
        {step.image?.asset ? (
          <figure className="mt-4 overflow-hidden rounded-xl border border-border bg-muted/30">
            <DatoResponsivePicture
              mobile={step.image.asset}
              desktop={step.image.assetDesktop}
              fallbackAlt={step.title}
              decoding="async"
              className="h-auto w-full object-cover"
              sizes={stepImageSizes(total)}
            />
          </figure>
        ) : null}
      </article>
    </li>
  );
}

export function StepsSectionBlock({ record, locale }: StepsSectionBlockProps) {
  const title = readCdaString(record as Record<string, unknown>, "title", "title");
  const subtitle = readCdaString(record as Record<string, unknown>, "subtitle", "subtitle");
  const steps = readSteps(record);
  if (steps.length === 0) return null;

  const headingId = `steps-section-${record.id}`;
  const connector = connectorVisibility(steps.length);

  return (
    <section
      {...cmsBlockAttrs(record)}
      data-datocms-content-link-boundary=""
      className="not-prose my-12 w-full py-6"
      {...(title
        ? { "aria-labelledby": headingId }
        : { "aria-label": FALLBACK_SECTION_LABEL[locale] })}
    >
      <Container size="lg" name="StepsSection" className="flex flex-col gap-10">
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

        <div className={cn("relative", stepsWidthClass(steps.length))}>
          {/* A linha passa pelo centro dos cards e fica visível apenas nos vãos entre eles. */}
          {connector.vertical ? (
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-y-0 left-1/2 z-0 w-px -translate-x-1/2 bg-foreground/25",
                connector.vertical,
              )}
            />
          ) : null}
          {connector.horizontal ? (
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute top-1/2 right-[12%] left-[12%] z-0 h-px -translate-y-1/2 bg-foreground/25",
                connector.horizontal,
              )}
            />
          ) : null}
          <ol className={cn("relative z-10 m-0 grid list-none gap-6 p-0", stepsColumnsClass(steps.length))}>
            {steps.map((step, index) => (
              <StepCard key={step.id} step={step} index={index} total={steps.length} />
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
