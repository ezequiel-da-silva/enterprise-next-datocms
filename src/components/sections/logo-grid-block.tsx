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
  /** Classe extra no figure (marquee vs grid). */
  className?: string;
  /** Marca o clone do marquee (oculto com prefers-reduced-motion). */
  marqueeClone?: boolean;
};

function LogoCell({ item, grayscale, className, marqueeClone = false }: LogoCellProps) {
  const mobile = logoMobile(item);
  if (!mobile?.url) return null;
  const alt = mobile.alt?.trim() || "Logo";

  return (
    <figure
      {...(marqueeClone ? { "data-marquee-clone": "" } : {})}
      className={cn(
        "flex h-16 items-center justify-center sm:h-20",
        grayscale &&
          "opacity-70 grayscale transition-[filter,opacity] duration-300 hover:opacity-100 hover:grayscale-0",
        className,
      )}
    >
      <DatoResponsivePicture
        mobile={mobile}
        desktop={item.assetDesktop}
        className="max-h-12 w-auto max-w-[9rem] object-contain object-center sm:max-h-14 sm:max-w-[11rem]"
        sizes="176px"
        fallbackAlt={alt}
      />
    </figure>
  );
}

export type LogoGridBlockProps = {
  record: LogoGridBlockRecord;
  /** Reservado para i18n futuro (aria / copy). */
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
      className="not-prose my-12 w-full"
      aria-labelledby={title ? headingId : undefined}
      aria-label={!title ? "Logos" : undefined}
    >
      <Container size="lg" name="LogoGrid" className="flex flex-col gap-8">
        {title || subtitle ? (
          <header className="mx-auto max-w-3xl text-center">
            {title ? (
              <h2
                id={headingId}
                className="text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
              >
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p
                className={cn(
                  "text-lg leading-relaxed text-muted-foreground",
                  title ? "mt-4" : "mt-0",
                )}
              >
                {subtitle}
              </p>
            ) : null}
          </header>
        ) : null}

        {layoutStyle === "marquee" ? (
          <div className="logo-marquee relative overflow-hidden" role="presentation">
            <div className="logo-marquee__track flex w-max items-center gap-10 pe-10 sm:gap-14 sm:pe-14">
              {logos.map((item) => (
                <LogoCell
                  key={item.id}
                  item={item}
                  grayscale={grayscale}
                  className="shrink-0"
                />
              ))}
              {/* Clone para loop contínuo; oculto com prefers-reduced-motion */}
              {logos.map((item) => (
                <LogoCell
                  key={`${item.id}-clone`}
                  item={item}
                  grayscale={grayscale}
                  className="shrink-0"
                  marqueeClone
                />
              ))}
            </div>
          </div>
        ) : (
          <ul className="m-0 grid list-none grid-cols-2 gap-6 p-0 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 sm:gap-8">
            {logos.map((item) => (
              <li key={item.id} className="min-w-0">
                <LogoCell item={item} grayscale={grayscale} />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}
