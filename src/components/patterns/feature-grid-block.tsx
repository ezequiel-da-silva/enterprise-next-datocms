import { CardItem, FullBleedCard } from "@/components/patterns/feature-grid-card";
import { FeatureGridCarousel } from "@/components/patterns/feature-grid-carousel";
import { SectionTextHeader } from "@/components/patterns/section-text-header";
import type { AppLocale } from "@/constants/i18n";
import type { CardRecord, FeatureGridRecord } from "@/infra/datocms/types-page";
import { readCdaArray } from "@/lib/datocms/cda-field";
import { cmsBlockAttrs } from "@/lib/datocms/cms-block-attrs";
import { resolveFeatureGridOptions } from "@/lib/datocms/resolve-feature-grid-options";
import { sectionLandmarkProps, textHeaderFromRecord } from "@/lib/datocms/resolve-text-header";
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
  const header = textHeaderFromRecord(record as Record<string, unknown>);
  const cards = readGridCards(record);
  if (cards.length === 0) return null;

  const options = resolveFeatureGridOptions(record as Record<string, unknown>);
  const headingId = `feature-grid-${record.id}`;
  const cardHeading = header.title ? "h3" : "h2";
  const sectionLabel = FEATURE_GRID_COPY[locale].sectionLabel;

  return (
    <section
      {...cmsBlockAttrs(record)}
      data-datocms-content-link-boundary=""
      id={header.sectionId}
      className="not-prose my-12 w-full"
      {...sectionLandmarkProps(header, headingId, sectionLabel)}
    >
      <SectionTextHeader
        header={header}
        headingId={headingId}
        className="mb-10"
        headingClassName="text-3xl font-semibold md:text-4xl"
        descriptionClassName="mt-4 text-lg leading-relaxed"
      />

      <FeatureGridCarousel
        locale={locale}
        options={options}
        {...(header.title ? { labelledBy: headingId } : { label: sectionLabel })}
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
