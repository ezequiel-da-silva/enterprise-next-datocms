import { Container } from "@/components/atoms/container";
import { DatoResponsivePicture } from "@/components/patterns/dato-responsive-picture";
import type { AppLocale } from "@/constants/i18n";
import type { FileFieldLike, LogoGridBlockRecord } from "@/infra/datocms/types-page";
import { readCdaArray, readCdaString } from "@/lib/datocms/cda-field";
import { cmsBlockAttrs } from "@/lib/datocms/cms-block-attrs";
import { resolveLogoGridOptions } from "@/lib/datocms/resolve-logo-grid-options";
import { cn } from "@/lib/cn";

type LogoItem = LogoGridBlockRecord["logos"][number];

function readLogos(record: LogoGridBlockRecord): LogoItem[] {
  const raw = record.logos ?? readCdaArray<LogoItem>(record as Record<string, unknown>, "logos", "logos");
  return raw.filter((item): item is LogoItem => Boolean(item?.asset?.url));
}

function logoMobile(item: LogoItem): FileFieldLike | null {
  return item.asset?.url ? item.asset : null;
}

type LogoCellProps = {
  item: LogoItem;
  grayscale: boolean;
  className?: string;
  marqueeClone?: boolean;
};

function LogoCell({ item, grayscale, className, marqueeClone = false }: LogoCellProps) {
  const mobile = logoMobile(item);
  if (!mobile?.url) return null;

  // Garante um texto alternativo útil caso o alt do DatoCMS esteja em branco
  const alt = mobile.alt?.trim() || "Logo do parceiro";

  return (
    <figure
      {...(marqueeClone ? { "data-marquee-clone": "", "aria-hidden": "true" } : {})}
      className={cn(
        "flex h-16 w-32 items-center justify-center p-1 sm:h-20 sm:w-40",
        "transition-transform duration-300 hover:scale-105",
        grayscale
          ? "opacity-60 grayscale transition-[filter,opacity,transform] duration-300 hover:opacity-100 hover:grayscale-0"
          : "opacity-85 hover:opacity-100",
        className
      )}
    >
      <DatoResponsivePicture
        mobile={mobile}
        desktop={item.assetDesktop}
        className="max-h-14 w-full max-w-full object-contain object-center sm:max-h-16"
        sizes="200px"
        fallbackAlt={alt}
      />
    </figure>
  );
}

export type LogoGridBlockProps = {
  record: LogoGridBlockRecord;
  locale?: AppLocale;
};

export function LogoGridBlock({ record }: LogoGridBlockProps) {
  const title = readCdaString(record as Record<string, unknown>, "title", "title");
  const subtitle = readCdaString(record as Record<string, unknown>, "subtitle", "subtitle");
  const logos = readLogos(record);
  const { layoutStyle, grayscale } = resolveLogoGridOptions(record as Record<string, unknown>);
  const headingId = `logo-grid-${record.id}`;

  if (logos.length === 0) return null;

  return (
    <section
      {...cmsBlockAttrs(record)}
      data-datocms-content-link-boundary=""
      className="not-prose my-12 w-full py-6 bg-muted/10"
      aria-labelledby={title ? headingId : undefined}
      aria-label={!title ? "Logos e Parceiros" : undefined}
    >
      <Container size="lg" name="LogoGrid" className="flex flex-col gap-8">
        {title || subtitle ? (
          <header className="mx-auto max-w-3xl text-center">
            {title ? (
              <h2
                id={headingId}
                className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
              >
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p className={cn("text-base text-muted-foreground", title ? "mt-2" : "mt-0")}>
                {subtitle}
              </p>
            ) : null}
          </header>
        ) : null}

        {layoutStyle === "marquee" ? (
          <div
            className="logo-marquee relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
            role="region"
            aria-label="Carrossel de parceiros"
          >
            <ul className="logo-marquee__track m-0 flex list-none items-center gap-10 p-0 pe-10 hover:[animation-play-state:paused] sm:gap-14 sm:pe-14">
              {logos.map((item) => (
                <li key={item.id} className="shrink-0">
                  <LogoCell item={item} grayscale={grayscale} />
                </li>
              ))}
              {/* Clones com aria-hidden="true" ativado no LogoCell para prevenir leitura duplicada */}
              {logos.map((item) => (
                <li key={`${item.id}-clone`} className="shrink-0" aria-hidden="true">
                  <LogoCell item={item} grayscale={grayscale} marqueeClone />
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <ul className="m-0 grid list-none grid-cols-2 gap-6 p-0 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 sm:gap-8">
            {logos.map((item) => (
              <li key={item.id} className="flex items-center justify-center min-w-0">
                <LogoCell item={item} grayscale={grayscale} />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}