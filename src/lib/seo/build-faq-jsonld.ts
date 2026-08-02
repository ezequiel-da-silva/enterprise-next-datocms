import type { FaqGroupItem } from "@/lib/datocms/resolve-faq-group-options";

export function buildFaqPageJsonLd(items: FaqGroupItem[]): Record<string, unknown> | null {
  if (items.length === 0) return null;

  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
