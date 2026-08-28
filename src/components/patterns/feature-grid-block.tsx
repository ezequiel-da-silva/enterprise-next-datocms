import { CardItem, FullBleedCard } from "@/components/patterns/feature-grid-card";
import { FeatureGridCarousel } from "@/components/patterns/feature-grid-carousel";
import type { AppLocale } from "@/constants/i18n";
import type { CardRecord, FeatureGridRecord } from "@/infra/datocms/types-page";
import { readCdaArray, readCdaString } from "@/lib/datocms/cda-field";
import { cmsBlockAttrs } from "@/lib/datocms/cms-block-attrs";
import { resolveFeatureGridOptions } from "@/lib/datocms/resolve-feature-grid-options";
import { FEATURE_GRID_COPY } from "@/lib/i18n/feature-grid-copy";

function readGridCards(record: FeatureGridRecord): CardRecord[] {
  const raw =
    record.itemsFeatureGrid ??
    readCdaArray<CardRecord>(record, "itemsFeatureGrid", "items_feature_grid");
  return raw.filter(
    (card): card is CardRecord =>
      card != null && (!card.__typename || card.__typename === "CardRecord"),
  );
}

export type FeatureGridBlockProps = {
  record: FeatureGridRecord;
  locale: AppLocale;
};

export function FeatureGridBlock({ record, locale }: FeatureGridBlockProps) {
  const title = readCdaString(record as Record<string, unknown>, "titleFeatureGrid", "title_feature_grid");
  const subtitle = readCdaString(
    record as Record<string, unknown>,
    "subtitleFeatureGrid",
    "subtitle_feature_grid",
  );
  const cards = readGridCards(record);
  if (cards.length === 0) return null;

  const options = resolveFeatureGridOptions(record as Record<string, unknown>);
  const headingId = `feature-grid-${record.id}`;
  const hasHeader = Boolean(title || subtitle);
  const cardHeading = title ? "h3" : "h2";
  const sectionLabel = FEATURE_GRID_COPY[locale].sectionLabel;

  return (
    <section
      {...cmsBlockAttrs(record)}
      data-datocms-content-link-boundary=""
      id={options.sectionId}
      className="not-prose my-12 w-full"
      {...(title
        ? { "aria-labelledby": headingId }
        : { "aria-label": sectionLabel })}
    >
      {hasHeader ? (
        <header className="mx-auto mb-10 max-w-3xl text-center">
          {title ? (
            <h2
              id={headingId}
              className="text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
            >
              {title}
            </h2>
          ) : null}
          {subtitle ? (
            <p className={title ? "mt-4 text-lg leading-relaxed text-muted-foreground" : "text-lg leading-relaxed text-muted-foreground"}>
              {subtitle}
            </p>
          ) : null}
        </header>
      ) : null}

      <FeatureGridCarousel
        locale={locale}
        options={options}
        {...(title ? { labelledBy: headingId } : { label: sectionLabel })}
      >
        {cards.map((card) =>
          options.variant === "cards" ? (
            <CardItem
              key={card.id}
              card={card}
              locale={locale}
              heading={cardHeading}
            />
          ) : (
            <FullBleedCard
              key={card.id}
              card={card}
              locale={locale}
              heading={cardHeading}
            />
          ),
        )}
      </FeatureGridCarousel>
    </section>
  );
}
