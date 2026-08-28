import { Button } from "@/components/atoms/button";
import { DatoResponsivePicture } from "@/components/patterns/dato-responsive-picture";
import { FeatureGridCardIcon } from "@/components/patterns/feature-grid-card-icon";
import { SmartLink } from "@/components/patterns/smart-link";
import type { AppLocale } from "@/constants/i18n";
import type { CardRecord } from "@/infra/datocms/types-page";
import { cmsBlockAttrs } from "@/lib/datocms/cms-block-attrs";
import { readFeatureGridCardContent } from "@/lib/datocms/resolve-feature-grid-card";
import { cn } from "@/lib/cn";

export type FeatureGridCardHeading = "h2" | "h3";

export type CardItemProps = {
  card: CardRecord;
  locale: AppLocale;
  heading?: FeatureGridCardHeading;
};

export function CardItem({ card, locale, heading = "h3" }: CardItemProps) {
  const content = readFeatureGridCardContent(card, locale);
  const TitleTag = heading;
  const hasMedia = Boolean(content.image?.url);

  return (
    <article
      {...cmsBlockAttrs(card)}
      data-datocms-content-link-boundary=""
      className={cn(
        "group flex h-full w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm",
        "transition duration-200 hover:border-primary/25 hover:shadow-md motion-reduce:transition-none",
      )}
    >
      {hasMedia ? (
        <div className="relative">
          <figure className="aspect-[16/10] w-full overflow-hidden bg-muted [&>picture]:block [&>picture]:h-full [&>picture]:w-full">
            <DatoResponsivePicture
              mobile={content.image}
              desktop={content.desktopImage}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              sizes="(max-width: 767px) calc(100vw - 2rem), (max-width: 1023px) calc((min(100vw, 64rem) - 3rem) / 2), 360px"
              fallbackAlt={content.title || undefined}
            />
          </figure>
          {content.icon ? (
            <FeatureGridCardIcon
              icon={content.icon}
              className="absolute bottom-0 left-6 translate-y-1/2 border border-border/60 bg-background shadow-sm"
            />
          ) : null}
        </div>
      ) : null}

      {/* Com media, o topo reserva sempre a altura do badge para alinhar títulos entre cards com e sem ícone. */}
      <div className={cn("flex flex-1 flex-col p-6", hasMedia && "pt-10")}>
        {content.icon && !hasMedia ? (
          <FeatureGridCardIcon icon={content.icon} className="mb-4" />
        ) : null}
        {content.title ? (
          <TitleTag className="text-balance text-lg font-semibold tracking-tight text-foreground">
            {content.title}
          </TitleTag>
        ) : null}
        {content.description ? (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{content.description}</p>
        ) : null}
        {content.link ? (
          <div className="mt-auto pt-6">
            <Button asChild variant="outline" className="min-h-12 w-full sm:w-auto">
              <SmartLink record={content.link} locale={locale} tone="inherit">
                {content.linkLabel}
              </SmartLink>
            </Button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export type FullBleedCardProps = {
  card: CardRecord;
  locale: AppLocale;
  heading?: FeatureGridCardHeading;
};

export function FullBleedCard({ card, locale, heading = "h3" }: FullBleedCardProps) {
  const content = readFeatureGridCardContent(card, locale);
  const TitleTag = heading;
  const imageIsDecorative = Boolean(content.title || content.description);

  return (
    <article
      {...cmsBlockAttrs(card)}
      data-datocms-content-link-boundary=""
      className="relative flex h-[450px] overflow-hidden rounded-2xl bg-foreground text-background lg:h-[600px]"
    >
      {content.image?.url ? (
        <figure className="absolute inset-0 [&>picture]:block [&>picture]:h-full [&>picture]:w-full">
          <DatoResponsivePicture
            mobile={content.image}
            desktop={content.desktopImage}
            decorative={imageIsDecorative}
            className="h-full w-full object-cover"
            sizes="(max-width: 1023px) calc(100vw - 2rem), 1024px"
          />
        </figure>
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/20" aria-hidden />
      <div className="relative z-10 mt-auto max-w-3xl p-6 text-left text-white sm:p-10 lg:p-14">
        {content.title ? (
          <TitleTag className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
            {content.title}
          </TitleTag>
        ) : null}
        {content.description ? (
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
            {content.description}
          </p>
        ) : null}
        {content.link ? (
          <div className="mt-6">
            <Button asChild variant="primary" className="min-h-12">
              <SmartLink record={content.link} locale={locale} tone="inherit">
                {content.linkLabel}
              </SmartLink>
            </Button>
          </div>
        ) : null}
      </div>
    </article>
  );
}
