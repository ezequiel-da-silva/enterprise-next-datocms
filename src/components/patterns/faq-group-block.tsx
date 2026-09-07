import { FaqGroupAccordion } from "@/components/patterns/faq-group-accordion";
import { JsonLdScriptSync } from "@/components/patterns/seo-manager";
import { SectionTextHeader } from "@/components/patterns/section-text-header";
import type { FaqGroupBlockRecord } from "@/infra/datocms/types-page";
import { dastPlainText } from "@/lib/datocms/dast-plain-text";
import {
  resolveFaqGroupOptions,
  type FaqGroupItem,
} from "@/lib/datocms/resolve-faq-group-options";
import { sectionLandmarkProps, textHeaderFromRecord } from "@/lib/datocms/resolve-text-header";
import { buildFaqPageJsonLd } from "@/lib/seo/build-faq-jsonld";
import { claimFaqSchemaEmission } from "@/lib/seo/faq-schema-slot";
import { cmsBlockAttrs } from "@/lib/datocms/cms-block-attrs";
import { getNonce } from "@/lib/nonce";

type FaqGroupBlockProps = {
  record: FaqGroupBlockRecord;
};

function extractFaqItems(record: FaqGroupBlockRecord): FaqGroupItem[] {
  return record.questions
    .map((item) => {
      const question = dastPlainText(item.question?.value);
      const answer = dastPlainText(item.answer?.value);
      if (!question || !answer) return null;
      return { id: String(item.id), question, answer };
    })
    .filter((item): item is FaqGroupItem => item != null);
}

/** Bloco FAQ group do Structured Text — accordion configurável (defaults + campos CMS opcionais). */
export async function FaqGroupBlock({ record }: FaqGroupBlockProps) {
  const options = resolveFaqGroupOptions(record as Record<string, unknown>);
  const header = textHeaderFromRecord(record as Record<string, unknown>);
  const items = extractFaqItems(record);

  if (items.length === 0 && !header.title) return null;

  const headingId = `faq-${record.id}`;
  const faqJsonLd =
    options.enableFaqSchema && claimFaqSchemaEmission() ? buildFaqPageJsonLd(items) : null;
  const nonce = faqJsonLd ? await getNonce() : undefined;

  return (
    <section
      {...cmsBlockAttrs(record)}
      data-datocms-content-link-boundary=""
      id={header.sectionId}
      className="not-prose my-12 w-full"
      {...(header.title ? sectionLandmarkProps(header, headingId, "FAQ") : {})}
    >
      {faqJsonLd ? <JsonLdScriptSync graph={faqJsonLd} nonce={nonce} /> : null}
      <SectionTextHeader
        header={header}
        headingId={headingId}
        align={options.headerAlignment}
        className="mb-6"
        headingClassName="text-3xl font-semibold"
        descriptionClassName="mt-2 text-lg"
      />
      <FaqGroupAccordion groupId={String(record.id)} items={items} options={options} />
    </section>
  );
}
