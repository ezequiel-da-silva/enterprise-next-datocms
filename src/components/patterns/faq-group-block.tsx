import { FaqGroupAccordion } from "@/components/patterns/faq-group-accordion";
import { JsonLdScriptSync } from "@/components/patterns/seo-manager";
import type { FaqGroupBlockRecord } from "@/infra/datocms/types-page";
import { dastPlainText } from "@/lib/datocms/dast-plain-text";
import {
  resolveFaqGroupOptions,
  type FaqGroupItem,
} from "@/lib/datocms/resolve-faq-group-options";
import { buildFaqPageJsonLd } from "@/lib/seo/build-faq-jsonld";
import { claimFaqSchemaEmission } from "@/lib/seo/faq-schema-slot";
import { cn } from "@/lib/cn";
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
  const title = record.title?.trim() ?? "";
  const subtitle = record.hasSubtitle ? record.subtitle?.trim() ?? "" : "";
  const items = extractFaqItems(record);

  if (items.length === 0 && !title) return null;

  const headingId = `faq-${record.id}`;
  const faqJsonLd =
    options.enableFaqSchema && claimFaqSchemaEmission() ? buildFaqPageJsonLd(items) : null;
  const nonce = faqJsonLd ? await getNonce() : undefined;
  const headerAlign =
    options.headerAlignment === "center"
      ? "text-center"
      : options.headerAlignment === "right"
        ? "text-right"
        : "text-left";

  return (
    <section className="not-prose my-12 w-full" aria-labelledby={title ? headingId : undefined}>
      {faqJsonLd ? <JsonLdScriptSync graph={faqJsonLd} nonce={nonce} /> : null}
      {title ? (
        <header className={cn("mb-6", headerAlign)}>
          <h2 id={headingId} className="text-balance text-3xl font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          {subtitle ? <p className="mt-2 text-lg text-muted-foreground">{subtitle}</p> : null}
        </header>
      ) : null}
      <FaqGroupAccordion groupId={String(record.id)} items={items} options={options} />
    </section>
  );
}
