import { Container } from "@/components/atoms/container";
import { ContactForm } from "@/components/patterns/contact-form";
import { SectionTextHeader } from "@/components/patterns/section-text-header";
import { StructuredTextRenderer } from "@/components/patterns/structured-text-renderer";
import type { AppLocale } from "@/constants/i18n";
import type { ContactActionState } from "@/core/entities/contact";
import type { ContactFormSectionBlockRecord } from "@/infra/datocms/types-page";
import { readCdaBool, readCdaString } from "@/lib/datocms/cda-field";
import { cmsBlockAttrs } from "@/lib/datocms/cms-block-attrs";
import { sectionLandmarkProps, textHeaderFromRecord } from "@/lib/datocms/resolve-text-header";
import type { CdaStructuredTextValue } from "datocms-structured-text-utils";

type ContactFormSectionBlockProps = {
  record: ContactFormSectionBlockRecord;
  locale: AppLocale;
  contentLinkGroup?: boolean;
  action: (prev: ContactActionState, formData: FormData) => Promise<ContactActionState>;
};

const FALLBACK_SECTION_LABEL: Record<AppLocale, string> = {
  en: "Contact form",
  pt: "Formulário de contacto",
  es: "Formulario de contacto",
};

function introHasContent(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value !== "object") return false;
  const doc = (value as { document?: { children?: unknown[] } }).document;
  return Array.isArray(doc?.children) && doc.children.length > 0;
}

export function ContactFormSectionBlock({
  record,
  locale,
  contentLinkGroup = false,
  action,
}: ContactFormSectionBlockProps) {
  const fields = record as Record<string, unknown>;
  const hasTextHeader = readCdaBool(fields, "hasTextHeader", "has_text_header");
  const header = hasTextHeader
    ? textHeaderFromRecord(fields)
    : { title: "", description: "" };
  const intro = record.intro as CdaStructuredTextValue | null | undefined;
  const hasIntro = introHasContent(intro?.value);
  const successMessage = readCdaString(fields, "successMessage", "success_message");
  const privacyNote = readCdaString(fields, "privacyNote", "privacy_note");
  const headingId = `contact-form-${record.id}`;

  return (
    <section
      {...cmsBlockAttrs(record)}
      data-datocms-content-link-boundary=""
      className="not-prose my-12 w-full"
      id={header.sectionId}
      {...sectionLandmarkProps(header, headingId, FALLBACK_SECTION_LABEL[locale])}
    >
      <Container size="lg" name="ContactFormSection" className="flex flex-col gap-8">
        {hasTextHeader ? (
          <SectionTextHeader header={header} headingId={headingId} align="left" />
        ) : null}
        {hasIntro ? (
          <div className="max-w-xl">
            <StructuredTextRenderer data={intro} contentLinkGroup={contentLinkGroup} locale={locale} />
          </div>
        ) : null}
        <ContactForm
          action={action}
          successMessage={successMessage || undefined}
          privacyNote={privacyNote || undefined}
        />
      </Container>
    </section>
  );
}
