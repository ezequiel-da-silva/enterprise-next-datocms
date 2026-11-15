import { cmsRecordAttrs } from "@/lib/datocms/cms-block-attrs";
import type { PdpCopy } from "@/lib/i18n/pdp-copy";

export type ProductQuestionItem = {
  id: string;
  question: string;
  answer: string;
  editingUrl?: string | null;
};

type ProductQaSectionProps = {
  questions: ProductQuestionItem[];
  copy: Pick<PdpCopy, "questionsTitle">;
};

/**
 * Curated PDP Q&A (`product_page.questions`). Native disclosure per question — answers stay in
 * the HTML while collapsed (the FAQPage JSON-LD mirrors the same pairs). Returns null when empty.
 */
export function ProductQaSection({ questions, copy }: ProductQaSectionProps) {
  const items = questions.filter((item) => item.question.trim() && item.answer.trim());
  if (items.length === 0) return null;

  const headingId = "product-qa-heading";

  return (
    <section
      className="mt-12 space-y-4"
      aria-labelledby={headingId}
      data-datocms-content-link-boundary=""
      data-testid="product-qa"
    >
      <h2 id={headingId} className="type-heading">
        {copy.questionsTitle}
      </h2>
      <div className="divide-y divide-border rounded-xl border border-border">
        {items.map((item) => (
          <details
            key={item.id}
            className="group"
            data-datocms-content-link-boundary=""
            {...cmsRecordAttrs({ __typename: "ProductQuestionRecord", id: item.id })}
            {...(item.editingUrl ? { "data-datocms-content-link-url": item.editingUrl } : {})}
          >
            <summary className="touch-target-text cursor-pointer list-none px-4 py-3 text-sm font-medium text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
              <span className="inline-flex items-start gap-2">
                <span aria-hidden className="text-muted-foreground group-open:rotate-90">
                  ›
                </span>
                <span>{item.question}</span>
              </span>
            </summary>
            <p className="type-body whitespace-pre-line px-4 pb-4 pl-8">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
