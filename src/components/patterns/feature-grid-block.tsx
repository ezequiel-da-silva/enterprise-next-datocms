import { Button } from "@/components/atoms/button";
import { FeatureGridCardIcon } from "@/components/patterns/feature-grid-card-icon";
import type { DatoFontAwesomeIconJson } from "@/components/atoms/dynamic-fa-icon";
import { DatoResponsivePicture } from "@/components/patterns/dato-responsive-picture";
import { SmartLink } from "@/components/patterns/smart-link";
import { StructuredTextRenderer } from "@/components/patterns/structured-text-renderer";
import type { AppLocale } from "@/constants/i18n";
import type { CardRecord, FeatureGridRecord, FileFieldLike, LinkBlockRecord } from "@/infra/datocms/types-page";
import { readCdaArray, readCdaBool, readCdaObject, readCdaString } from "@/lib/datocms/cda-field";
import { resolveLinkBlock } from "@/lib/datocms/link-block";
import { cn } from "@/lib/cn";
import type { CdaStructuredTextValue } from "datocms-structured-text-utils";

function readCardIcon(card: CardRecord): DatoFontAwesomeIconJson | null {
  const raw = card.iconCard ?? readCdaObject<Record<string, unknown>>(card, "iconCard", "icon_card");
  if (!raw || typeof raw !== "object") return null;
  const icon = raw as Record<string, unknown>;
  const prefix = typeof icon.prefix === "string" ? icon.prefix : undefined;
  const iconName = typeof icon.iconName === "string" ? icon.iconName : undefined;
  if (!prefix && !iconName) return null;
  return { prefix, iconName };
}

function cardLink(card: CardRecord): LinkBlockRecord | null {
  if (card.linkCard?.__typename === "LinkRecord") return card.linkCard;
  const fromLink = readCdaObject<LinkBlockRecord>(card as Record<string, unknown>, "linkCard", "link_card");
  if (fromLink?.__typename === "LinkRecord") return fromLink;
  const legacyRaw = (card as Record<string, unknown>).buttonCard ?? (card as Record<string, unknown>).button_card;
  if (!legacyRaw) return null;
  if (Array.isArray(legacyRaw)) {
    return (legacyRaw as LinkBlockRecord[]).find((x) => x?.__typename === "LinkRecord") ?? null;
  }
  const legacy = legacyRaw as LinkBlockRecord;
  return legacy.__typename === "LinkRecord" ? legacy : null;
}

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
  const iconJson = readCardIcon(card);
  const link = cardLink(card);
  const label = (link?.ctaLabel ?? "").trim();
  const resolved = link ? resolveLinkBlock(link, locale) : null;
  const showCta = Boolean(label && resolved);
  const showImg = readCdaBool(card, "hasImage", "has_image");
  const heroMobile = showImg ? cardImageMobile(card) : null;
  const imgBlock = card.imageCard ?? readCdaObject<NonNullable<CardRecord["imageCard"]>>(card as Record<string, unknown>, "imageCard", "image_card");

  return (
    <article
      data-datocms-content-link-boundary=""
      className={cn(
        "flex h-full flex-col rounded-2xl border border-border/60 bg-muted/30 p-6 shadow-sm ring-1 ring-border/40",
        "transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-md",
      )}
    >
      <FeatureGridCardIcon icon={iconJson} title={title || undefined} />
      {heroMobile?.url ? (
        <figure className="mb-4 overflow-hidden rounded-xl border border-border/50 bg-background/50">
          <DatoResponsivePicture
            mobile={heroMobile}
            desktop={imgBlock?.assetDesktop}
            className="h-auto w-full object-cover"
            sizes="(max-width: 768px) 100vw, 360px"
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
    <section className="not-prose my-12 w-full" aria-labelledby={title ? headingId : undefined}>
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
