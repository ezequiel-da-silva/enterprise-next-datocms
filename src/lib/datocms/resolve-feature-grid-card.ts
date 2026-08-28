/**
 * CARD (`card`) field toggles.
 *
 * CMS booleans: `has_icon`, `has_description`, `has_image`, `has_link`.
 * `readCdaBool` is true only when the CDA value is exactly `true`.
 */
import type { AppLocale } from "@/constants/i18n";
import type { CardRecord, FileFieldLike, LinkBlockRecord } from "@/infra/datocms/types-page";
import { readCdaBool, readCdaObject, readCdaString } from "@/lib/datocms/cda-field";
import type { DatoFontAwesomeIconJson } from "@/lib/datocms/fa-icon-types";
import { resolveLinkBlock } from "@/lib/datocms/link-block";

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
};

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

export function readFeatureGridCardContent(
  card: CardRecord,
  locale: AppLocale,
): FeatureGridCardContent {
  const fields = card as Record<string, unknown>;
  const link = resolveCardLinkRecord(fields);
  const linkLabel = (link?.ctaLabel ?? "").trim();
  const validLink =
    resolveCardShowLink(fields) && link && linkLabel && resolveLinkBlock(link, locale) ? link : null;
  const imageBlock = readImageBlock(card);
  const image =
    resolveCardShowImage(fields) && imageBlock?.asset?.url ? imageBlock.asset : null;
  const description = resolveCardShowDescription(fields)
    ? readCdaString(card, "descriptionCard", "description_card")
    : "";
  const icon = resolveCardShowIcon(fields) ? readCardIconJson(fields) : null;

  return {
    title: readCdaString(card, "titleCard", "title_card"),
    description,
    icon,
    link: validLink,
    linkLabel: validLink ? linkLabel : "",
    image,
    desktopImage: image ? imageBlock?.assetDesktop ?? null : null,
  };
}
