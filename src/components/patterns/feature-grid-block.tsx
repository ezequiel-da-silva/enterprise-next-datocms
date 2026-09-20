import { CardItem, FullBleedCard } from "@/components/patterns/feature-grid-card";
import { FeatureGridCarousel } from "@/components/patterns/feature-grid-carousel";
import { SectionTextHeader } from "@/components/patterns/section-text-header";
import type { AppLocale } from "@/constants/i18n";
import type { CardRecord, FeatureGridRecord } from "@/infra/datocms/types-page";
import {
  getStorefrontCollectionMeta,
  getStorefrontProductsByHandles,
} from "@/infra/shopify/storefront";
import { readCdaArray } from "@/lib/datocms/cda-field";
import { cmsBlockAttrs } from "@/lib/datocms/cms-block-attrs";
import { resolveFeatureGridOptions } from "@/lib/datocms/resolve-feature-grid-options";
import {
  readCardCatalogTarget,
  readFeatureGridCardContent,
  type FeatureGridCatalog,
} from "@/lib/datocms/resolve-feature-grid-card";
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

async function loadFeatureGridCatalog(cards: CardRecord[], locale: AppLocale): Promise<FeatureGridCatalog> {
  const productHandles: string[] = [];
  const collectionHandles: string[] = [];
  for (const card of cards) {
    const target = readCardCatalogTarget(card as Record<string, unknown>);
    if (!target) continue;
    if (target.source === "product") productHandles.push(target.handle);
    else collectionHandles.push(target.handle);
  }

  const [products, collections] = await Promise.all([
    getStorefrontProductsByHandles(productHandles, locale),
    Promise.all(collectionHandles.map((handle) => getStorefrontCollectionMeta(handle, locale))),
  ]);

  return {
    products: Object.fromEntries(products.map((product) => [product.handle, product])),
    collections: Object.fromEntries(
      collections.flatMap((collection) => (collection ? [[collection.handle, collection] as const] : [])),
    ),
  };
}

export type FeatureGridBlockProps = {
  record: FeatureGridRecord;
  locale: AppLocale;
};

export async function FeatureGridBlock({ record, locale }: FeatureGridBlockProps) {
  const header = textHeaderFromRecord(record as Record<string, unknown>);
  const cards = readGridCards(record);
  if (cards.length === 0) return null;

  const catalog = await loadFeatureGridCatalog(cards, locale);
  const resolved = cards.flatMap((card) => {
    const content = readFeatureGridCardContent(card, locale, catalog);
    return content ? [{ card, content }] : [];
  });
  if (resolved.length === 0) return null;

  const options = resolveFeatureGridOptions(record as Record<string, unknown>);
  const headingId = `feature-grid-${record.id}`;
  const cardHeading = header.title ? "h3" : "h2";
  const sectionLabel = FEATURE_GRID_COPY[locale].sectionLabel;
  const items = resolved.map(({ card, content }) =>
    options.variant === "cards" ? (
      <CardItem
        key={card.id}
        card={card}
        locale={locale}
        content={content}
        heading={cardHeading}
      />
    ) : (
      <FullBleedCard
        key={card.id}
        card={card}
        locale={locale}
        content={content}
        heading={cardHeading}
      />
    ),
  );

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

      {resolved.length > 1 ? (
        <FeatureGridCarousel
          locale={locale}
          options={options}
          {...(header.title ? { labelledBy: headingId } : { label: sectionLabel })}
        >
          {items}
        </FeatureGridCarousel>
      ) : (
        items
      )}
    </section>
  );
}
