import { describe, expect, it } from "vitest";
import { buildRatingHistogram, buildReviewsSectionJsonLd } from "./build-reviews-jsonld";

describe("buildReviewsSectionJsonLd", () => {
  it("returns null when there are no rated reviews", () => {
    expect(buildReviewsSectionJsonLd("sec-1", [])).toBeNull();
  });

  it("builds Organization AggregateRating and Review entries", () => {
    const graph = buildReviewsSectionJsonLd("sec-1", [
      { id: "r1", authorName: "Ana", rating: 5, comment: "Ótimo serviço." },
      { id: "r2", authorName: "Bob", rating: 3, comment: "Bom, mas pode melhorar." },
    ]);

    expect(graph).not.toHaveProperty("@context");
    expect(graph).toMatchObject({
      "@type": "Organization",
      "@id": "http://localhost:3000/#organization",
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
    expect((graph?.review as { itemReviewed: { "@id": string } }[])[0]?.itemReviewed).toEqual({
      "@id": "http://localhost:3000/#organization",
    });
  });
});

describe("buildRatingHistogram", () => {
  it("returns null without valid ratings", () => {
    expect(buildRatingHistogram([])).toBeNull();
    expect(buildRatingHistogram([{ rating: 0 }, { rating: 6 }, { rating: Number.NaN }])).toBeNull();
  });

  it("counts 5 to 1 stars and rounds percent of the rated total", () => {
    const histogram = buildRatingHistogram([
      { rating: 5 },
      { rating: 5 },
      { rating: 4 },
      { rating: 1 },
      { rating: 0 },
    ]);
    expect(histogram?.total).toBe(4);
    expect(histogram?.rows.map((row) => row.stars)).toEqual([5, 4, 3, 2, 1]);
    expect(histogram?.rows.map((row) => row.count)).toEqual([2, 1, 0, 0, 1]);
    expect(histogram?.rows.map((row) => row.percent)).toEqual([50, 25, 0, 0, 25]);
  });

  it("rounds fractional ratings to the nearest star bucket", () => {
    expect(buildRatingHistogram([{ rating: 4.6 }])?.rows[0]).toMatchObject({ stars: 5, count: 1, percent: 100 });
  });
});
