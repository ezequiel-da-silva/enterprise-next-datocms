/**
 * Bloco `text_header` (`textHeaderSection` no CDA — array 0–1).
 *
 * | Campo            | API key          | Default      |
 * |------------------|------------------|--------------|
 * | title            | title            | "" (opcional)|
 * | has_description  | has_description  | false        |
 * | description      | description      | ""           |
 * | has_section_id   | has_section_id   | false        |
 * | section_id       | section_id       | —            |
 *
 * `has_*` desligado ignora o valor residual do campo. `section_id` só aplica
 * na `<section>` da página, nunca em cards internos.
 */
import { readCdaBlock, readCdaBool, readCdaString, readCdaStringForLogic } from "@/lib/datocms/cda-field";

export type TextHeader = {
  title: string;
  description: string;
  sectionId?: string;
};

export const TEXT_HEADER_DEFAULTS: TextHeader = {
  title: "",
  description: "",
};

export function sanitizeSectionId(raw: string): string | undefined {
  const slug = raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug.length > 0 ? slug : undefined;
}

export function resolveTextHeader(source: unknown): TextHeader {
  const record = readCdaBlock<Record<string, unknown>>(
    { textHeaderSection: source },
    "textHeaderSection",
    "text_header_section",
  );
  if (!record) return { ...TEXT_HEADER_DEFAULTS };

  const hasDescription = readCdaBool(record, "hasDescription", "has_description");
  const hasSectionId = readCdaBool(record, "hasSectionId", "has_section_id");
  const sectionRaw = hasSectionId
    ? readCdaStringForLogic(record, "sectionId", "section_id")
    : "";

  return {
    title: readCdaString(record, "title", "title"),
    description: hasDescription ? readCdaString(record, "description", "description") : "",
    sectionId: sectionRaw ? sanitizeSectionId(sectionRaw) : undefined,
  };
}

export function textHeaderFromRecord(record: Record<string, unknown>): TextHeader {
  return resolveTextHeader(record.textHeaderSection ?? record.text_header_section);
}

export function sectionLandmarkProps(
  header: TextHeader,
  headingId: string,
  fallbackLabel: string,
): { "aria-labelledby": string } | { "aria-label": string } {
  if (header.title) return { "aria-labelledby": headingId };
  return { "aria-label": fallbackLabel };
}
