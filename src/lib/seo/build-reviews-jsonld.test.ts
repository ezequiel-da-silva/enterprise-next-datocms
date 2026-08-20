import { describe, expect, it } from "vitest";
import { buildReviewsSectionJsonLd } from "./build-reviews-jsonld";

describe("buildReviewsSectionJsonLd", () => {
  it("returns null when there are no rated reviews", () => {
    expect(buildReviewsSectionJsonLd("sec-1", [])).toBeNull();
  });

  it("builds Organization AggregateRating and Review entries", () => {
    const graph = buildReviewsSectionJsonLd("sec-1", [
      { id: "r1", authorName: "Ana", rating: 5, comment: "Ótimo serviço." },
      { id: "r2", authorName: "Bob", rating: 3, comment: "Bom, mas pode melhorar." },
    ]);

    expect(graph).toMatchObject({
      "@type": "Organization",
      name: "next-dato",
      url: "http://localhost:3000",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: 4,
        reviewCount: 2,
        bestRating: 5,
        worstRating: 1,
      },
    });
    expect(Array.isArray(graph?.review)).toBe(true);
    expect((graph?.review as unknown[]).length).toBe(2);
  });
});
