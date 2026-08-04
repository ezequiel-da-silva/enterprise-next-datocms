import type { DatoFontAwesomeIconJson } from "@/components/atoms/dynamic-fa-icon";
import type { LinkBlockRecord } from "@/infra/datocms/types-page";
import { readCdaBool, readCdaObject } from "@/lib/datocms/cda-field";

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
