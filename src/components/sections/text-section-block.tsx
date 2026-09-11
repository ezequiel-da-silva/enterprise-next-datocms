import { Container } from "@/components/atoms/container";
import { SectionTextHeader } from "@/components/patterns/section-text-header";
import { StructuredTextRenderer } from "@/components/patterns/structured-text-renderer";
import type { AppLocale } from "@/constants/i18n";
import type { TextSectionBlockRecord } from "@/infra/datocms/types-page";
import { readCdaBool } from "@/lib/datocms/cda-field";
import { cmsBlockAttrs } from "@/lib/datocms/cms-block-attrs";
import { sectionLandmarkProps, textHeaderFromRecord } from "@/lib/datocms/resolve-text-header";
import type { CdaStructuredTextValue } from "datocms-structured-text-utils";

type TextSectionBlockProps = {
  record: TextSectionBlockRecord;
  locale: AppLocale;
  contentLinkGroup?: boolean;
};

const FALLBACK_SECTION_LABEL: Record<AppLocale, string> = {
  en: "Text",
  pt: "Texto",
  es: "Texto",
};

function bodyHasContent(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value !== "object") return false;
  const doc = (value as { document?: { children?: unknown[] } }).document;
  return Array.isArray(doc?.children) && doc.children.length > 0;
}

export function TextSectionBlock({
  record,
  locale,
  contentLinkGroup = false,
}: TextSectionBlockProps) {
  const fields = record as Record<string, unknown>;
  const hasTextHeader = readCdaBool(fields, "hasTextHeader", "has_text_header");
  const header = hasTextHeader
    ? textHeaderFromRecord(fields)
    : { title: "", description: "" };
  const body = record.body as CdaStructuredTextValue | null | undefined;
  const hasBody = bodyHasContent(body?.value);
  if (!header.title && !header.description && !hasBody) return null;

  const headingId = `text-section-${record.id}`;

  return (
    <section
      {...cmsBlockAttrs(record)}
      data-datocms-content-link-boundary=""
      className="not-prose my-12 w-full"
      id={header.sectionId}
      {...sectionLandmarkProps(header, headingId, FALLBACK_SECTION_LABEL[locale])}
    >
      <Container size="lg" name="TextSection" className="flex flex-col gap-8">
        {hasTextHeader ? (
          <SectionTextHeader header={header} headingId={headingId} align="left" />
        ) : null}
        {hasBody ? (
          <StructuredTextRenderer data={body} contentLinkGroup={contentLinkGroup} locale={locale} />
        ) : null}
      </Container>
    </section>
  );
}
