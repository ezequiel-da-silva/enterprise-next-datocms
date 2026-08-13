import { Button } from "@/components/atoms/button";
import { FeatureGridCardIcon } from "@/components/patterns/feature-grid-card-icon";
import { DatoResponsivePicture } from "@/components/patterns/dato-responsive-picture";
import { SmartLink } from "@/components/patterns/smart-link";
import { StructuredTextRenderer } from "@/components/patterns/structured-text-renderer";
import type { AppLocale } from "@/constants/i18n";
import type { CardRecord, FeatureGridRecord, FileFieldLike } from "@/infra/datocms/types-page";
import { readCdaArray, readCdaObject, readCdaString } from "@/lib/datocms/cda-field";
import {
  readCardIconJson,
  resolveCardLinkRecord,
  resolveCardShowImage,
  resolveCardShowLink,
} from "@/lib/datocms/resolve-feature-grid-card";
import { resolveLinkBlock } from "@/lib/datocms/link-block";
import { cmsBlockAttrs } from "@/lib/datocms/cms-block-attrs";
import { cn } from "@/lib/cn";
import type { CdaStructuredTextValue } from "datocms-structured-text-utils";

function cardImageMobile(card: CardRecord): FileFieldLike | null {
  const img = card.imageCard ?? readCdaObject<NonNullable<CardRecord["imageCard"]>>(card as Record<string, unknown>, "imageCard", "image_card");
  return img?.asset?.url ? img.asset : null;
}

export type CardItemProps = {
  card: CardRecord;
  locale: AppLocale;
};

export function CardItem({ card, locale }: CardItemProps) {
  const title = readCdaString(card, "titleCard", "title_card");
  const description = readCdaString(card, "descriptionCard", "description_card");
  const iconJson = readCardIconJson(card as Record<string, unknown>);
  const link = resolveCardLinkRecord(card as Record<string, unknown>);
  const label = (link?.ctaLabel ?? "").trim();
  const resolved = link ? resolveLinkBlock(link, locale) : null;
  const showLink = resolveCardShowLink(card as Record<string, unknown>);
  const showCta = showLink && Boolean(label && resolved);
  const showImg = resolveCardShowImage(card as Record<string, unknown>);
  const heroMobile = showImg ? cardImageMobile(card) : null;
  const imgBlock = card.imageCard ?? readCdaObject<NonNullable<CardRecord["imageCard"]>>(card as Record<string, unknown>, "imageCard", "image_card");

  return (
    <article
      {...cmsBlockAttrs(card)}
      data-datocms-content-link-boundary=""
      className={cn(
        "flex h-full flex-col rounded-2xl border border-border/60 bg-muted/30 p-6 shadow-sm ring-1 ring-border/40",
        "transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-md",
      )}
    >
      <FeatureGridCardIcon icon={iconJson} title={title || undefined} />
      {heroMobile?.url ? (
        <figure className="mb-4 aspect-[4/3] overflow-hidden rounded-xl border border-border/50 bg-background/50 [&>picture]:block [&>picture]:h-full [&>picture]:w-full">
          <DatoResponsivePicture
            mobile={heroMobile}
            desktop={imgBlock?.assetDesktop}
            className="h-full w-full object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 320px"
            fallbackAlt={title || undefined}
          />
        </figure>
      ) : null}
      {title ? <h3 className="text-balance text-lg font-semibold tracking-tight text-foreground">{title}</h3> : null}
      {description ? <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
      {showCta && link ? (
        <div className="mt-6">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <SmartLink record={link} locale={locale}>
              {label}
            </SmartLink>
          </Button>
        </div>
      ) : null}
    </article>
  );
}

function readGridCards(record: FeatureGridRecord): CardRecord[] {
  const raw =
    record.itemsFeatureGrid ??
    readCdaArray<CardRecord>(record, "itemsFeatureGrid", "items_feature_grid");
  return raw.filter((c): c is CardRecord => c != null);
}

export type FeatureGridBlockProps = {
  record: FeatureGridRecord;
  locale: AppLocale;
  contentLinkGroup?: boolean;
};

export function FeatureGridBlock({ record, locale, contentLinkGroup = false }: FeatureGridBlockProps) {
  const title = readCdaString(record as Record<string, unknown>, "titleFeatureGrid", "title_feature_grid");
  const descriptionRaw =
    (record as Record<string, unknown>).descriptionGrid ??
    (record as Record<string, unknown>).description_grid;
  const cards = readGridCards(record);
  const headingId = `feature-grid-${record.id}`;

  return (
    <section
      {...cmsBlockAttrs(record)}
      className="not-prose my-12 w-full"
      aria-labelledby={title ? headingId : undefined}
    >
      <header className="mx-auto mb-10 max-w-3xl text-center">
        {title ? (
          <h2 id={headingId} className="text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            {title}
          </h2>
        ) : null}
        {descriptionRaw == null || descriptionRaw === "" ? null : typeof descriptionRaw === "string" ? (
          <p className={cn("mt-4 text-lg leading-relaxed text-muted-foreground", !title && "mt-0")}>{descriptionRaw}</p>
        ) : (
          <div className={cn("mt-4 text-lg leading-relaxed text-muted-foreground [&_p]:mt-0", !title && "mt-0")}>
            <StructuredTextRenderer
              data={descriptionRaw as CdaStructuredTextValue}
              contentLinkGroup={contentLinkGroup}
              locale={locale}
            />
          </div>
        )}
      </header>

      {cards.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <CardItem key={card.id} card={card} locale={locale} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
