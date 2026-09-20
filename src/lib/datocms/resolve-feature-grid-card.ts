/**
 * CARD (`card`) field toggles and catalog sources.
 *
 * | Campo             | API key             | Default                    |
 * |-------------------|---------------------|----------------------------|
 * | card_source       | card_source         | editorial                  |
 * | source_product    | source_product      | só com card_source=product |
 * | source_collection | source_collection   | só com card_source=collection |
 * | has_icon          | has_icon            | false — só editorial       |
 * | has_description   | has_description     | false                      |
 * | has_image         | has_image           | só editorial               |
 * | has_link          | has_link            | só editorial               |
 *
 * `readCdaBool` is true only when the CDA value is exactly `true`.
 * Catalog cards: title/href from `product_page`/`collection_page`; image/price from Storefront.
 */
import type { AppLocale } from "@/constants/i18n";
import type { CardRecord, FileFieldLike, LinkBlockRecord } from "@/infra/datocms/types-page";
import type {
  StorefrontCollectionMeta,
  StorefrontCollectionProduct,
  StorefrontProductImage,
} from "@/infra/shopify/storefront";
import { collectionPagePath } from "@/lib/datocms/collection-page-path";
import { readCdaBool, readCdaObject, readCdaString, readCdaStringForLogic } from "@/lib/datocms/cda-field";
import type { DatoFontAwesomeIconJson } from "@/lib/datocms/fa-icon-types";
import { resolveLinkBlock } from "@/lib/datocms/link-block";
import { productPagePath } from "@/lib/datocms/product-page-path";
import { resolveSpecializedImage } from "@/lib/datocms/resolve-specialized-image";
import { formatStorefrontMoney } from "@/lib/shopify/format-money";

export type CardSource = "editorial" | "product" | "collection";

export type CardCatalogTarget = {
  source: "product" | "collection";
  handle: string;
  title: string;
};

export type FeatureGridCatalog = {
  products: Record<string, StorefrontCollectionProduct>;
  collections: Record<string, StorefrontCollectionMeta>;
};

/** Whether the card icon should render (respects CMS `has_icon` toggle). */
export function resolveCardShowIcon(record: Record<string, unknown>): boolean {
  return readCdaBool(record, "hasIcon", "has_icon");
}

/** Whether the card description should render (respects CMS `has_description` toggle). */
export function resolveCardShowDescription(record: Record<string, unknown>): boolean {
  return readCdaBool(record, "hasDescription", "has_description");
}

/** Whether the card image block should render (respects CMS `has_image` toggle). */
export function resolveCardShowImage(record: Record<string, unknown>): boolean {
  return readCdaBool(record, "hasImage", "has_image");
}

/** Whether the card CTA link should render (respects CMS `has_link` toggle). */
export function resolveCardShowLink(record: Record<string, unknown>): boolean {
  return readCdaBool(record, "hasLink", "has_link");
}

/** Parses Font Awesome JSON from `icon_card` / `iconCard`. */
export function readCardIconJson(record: Record<string, unknown>): DatoFontAwesomeIconJson | null {
  const raw = record.iconCard ?? readCdaObject<Record<string, unknown>>(record, "iconCard", "icon_card");
  if (!raw || typeof raw !== "object") return null;
  const icon = raw as Record<string, unknown>;
  const prefix = typeof icon.prefix === "string" ? icon.prefix : undefined;
  const iconName = typeof icon.iconName === "string" ? icon.iconName : undefined;
  if (!prefix && !iconName) return null;
  return { prefix, iconName };
}

/** Resolves link record from `link_card` with legacy `button_card` fallback. */
export function resolveCardLinkRecord(record: Record<string, unknown>): LinkBlockRecord | null {
  const linkCard = record.linkCard ?? readCdaObject<LinkBlockRecord>(record, "linkCard", "link_card");
  if (linkCard && typeof linkCard === "object" && (linkCard as LinkBlockRecord).__typename === "LinkRecord") {
    return linkCard as LinkBlockRecord;
  }
  const legacyRaw = record.buttonCard ?? record.button_card;
  if (!legacyRaw) return null;
  if (Array.isArray(legacyRaw)) {
    return (legacyRaw as LinkBlockRecord[]).find((x) => x?.__typename === "LinkRecord") ?? null;
  }
  const legacy = legacyRaw as LinkBlockRecord;
  return legacy.__typename === "LinkRecord" ? legacy : null;
}

export type FeatureGridCardContent = {
  title: string;
  description: string;
  icon: DatoFontAwesomeIconJson | null;
  link: LinkBlockRecord | null;
  linkLabel: string;
  image: FileFieldLike;
  desktopImage: FileFieldLike;
  source: CardSource;
  href: string | null;
  catalogImage: StorefrontProductImage | null;
  priceLabel: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function linkedRecord(value: unknown): Record<string, unknown> | null {
  if (Array.isArray(value)) {
    const first = value[0];
    return isRecord(first) ? first : null;
  }
  return isRecord(value) ? value : null;
}

export function readCardSource(record: Record<string, unknown>): CardSource {
  const raw = readCdaStringForLogic(record, "cardSource", "card_source").trim().toLowerCase();
  if (raw === "product" || raw.includes("product")) return "product";
  if (raw === "collection" || raw.includes("collection")) return "collection";
  return "editorial";
}

export function readCardCatalogTarget(record: Record<string, unknown>): CardCatalogTarget | null {
  const source = readCardSource(record);
  if (source === "editorial") return null;
  const linked = linkedRecord(
    source === "product"
      ? (record.sourceProduct ?? record.source_product)
      : (record.sourceCollection ?? record.source_collection),
  );
  if (!linked) return null;
  const handle = readCdaStringForLogic(linked, "shopifyHandle", "shopify_handle");
  if (!handle) return null;
  return {
    source,
    handle,
    title: readCdaString(linked, "title", "title") || handle,
  };
}

function readImageBlock(card: CardRecord): NonNullable<CardRecord["imageCard"]> | null {
  return (
    card.imageCard ??
    readCdaObject<NonNullable<CardRecord["imageCard"]>>(
      card as Record<string, unknown>,
      "imageCard",
      "image_card",
    )
  );
}

function editorialCardContent(card: CardRecord, locale: AppLocale): FeatureGridCardContent {
  const fields = card as Record<string, unknown>;
  const link = resolveCardLinkRecord(fields);
  const linkLabel = (link?.ctaLabel ?? "").trim();
  const validLink =
    resolveCardShowLink(fields) && link && linkLabel && resolveLinkBlock(link, locale) ? link : null;
  const imageBlock = readImageBlock(card);
  const resolvedImage = resolveSpecializedImage(imageBlock);
  const image =
    resolveCardShowImage(fields) && resolvedImage.mobile ? resolvedImage.mobile : null;
  const description = resolveCardShowDescription(fields)
    ? readCdaString(card, "descriptionCard", "description_card")
    : "";
  const icon = resolveCardShowIcon(fields) ? readCardIconJson(fields) : null;

  return {
    source: "editorial",
    title: readCdaString(card, "titleCard", "title_card"),
    description,
    icon,
    link: validLink,
    linkLabel: validLink ? linkLabel : "",
    image,
    desktopImage: image ? resolvedImage.desktop : null,
    href: null,
    catalogImage: null,
    priceLabel: null,
  };
}

export function readFeatureGridCardContent(
  card: CardRecord,
  locale: AppLocale,
  catalog: FeatureGridCatalog = { products: {}, collections: {} },
): FeatureGridCardContent | null {
  const fields = card as Record<string, unknown>;
  const source = readCardSource(fields);
  if (source === "editorial") return editorialCardContent(card, locale);

  const target = readCardCatalogTarget(fields);
  if (!target) return null;

  if (target.source === "product") {
    const product = catalog.products[target.handle];
    if (!product) return null;
    const price = product.priceRange.minVariantPrice;
    return {
      source,
      title: target.title || product.title,
      description: resolveCardShowDescription(fields)
        ? readCdaString(card, "descriptionCard", "description_card")
        : "",
      icon: null,
      link: null,
      linkLabel: "",
      image: null,
      desktopImage: null,
      href: productPagePath(locale, target.handle),
      catalogImage: product.featuredImage,
      priceLabel: formatStorefrontMoney(locale, price.amount, price.currencyCode),
    };
  }

  const collection = catalog.collections[target.handle];
  if (!collection) return null;
  return {
    source,
    title: target.title || collection.title,
    description: resolveCardShowDescription(fields)
      ? readCdaString(card, "descriptionCard", "description_card")
      : "",
    icon: null,
    link: null,
    linkLabel: "",
    image: null,
    desktopImage: null,
    href: collectionPagePath(locale, target.handle),
    catalogImage: collection.image,
    priceLabel: null,
  };
}
