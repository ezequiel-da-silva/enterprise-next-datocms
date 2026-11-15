import { getOrganizationId, getOrganizationName, getSiteBaseUrl } from "@/lib/seo/site-config";

export type ReviewJsonLdItem = {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
};

export type RatingAggregate = {
  /** Uma casa decimal — o mesmo número tem de ser mostrado na página. */
  average: number;
  count: number;
};

/**
 * Fonte única da média: o bloco usa-a para o texto visível e o JSON-LD para
 * `aggregateRating`, evitando que markup e página divirjam.
 */
export function computeRatingAggregate(reviews: ReviewJsonLdItem[]): RatingAggregate | null {
  const rated = reviews.filter((r) => Number.isFinite(r.rating) && r.rating >= 1 && r.rating <= 5);
  if (rated.length === 0) return null;

  const sum = rated.reduce((acc, r) => acc + r.rating, 0);
  return { average: Math.round((sum / rated.length) * 10) / 10, count: rated.length };
}

export type RatingHistogramRow = {
  /** 5 → 1 (ordem de apresentação: mais estrelas primeiro). */
  stars: 1 | 2 | 3 | 4 | 5;
  count: number;
  /** Percentagem inteira 0–100 do total avaliado (arredondada). */
  percent: number;
};

export type RatingHistogram = {
  total: number;
  rows: RatingHistogramRow[];
};

/**
 * Distribuição 5★→1★ das reviews válidas (rating inteiro 1–5, mesmo critério que
 * {@link computeRatingAggregate}); ratings fracionários arredondam ao inteiro mais próximo.
 */
export function buildRatingHistogram(reviews: Pick<ReviewJsonLdItem, "rating">[]): RatingHistogram | null {
  const counts: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let total = 0;
  for (const review of reviews) {
    if (!Number.isFinite(review.rating) || review.rating < 1 || review.rating > 5) continue;
    counts[Math.round(review.rating) as 1 | 2 | 3 | 4 | 5] += 1;
    total += 1;
  }
  if (total === 0) return null;
  const order = [5, 4, 3, 2, 1] as const;
  return {
    total,
    rows: order.map((stars) => ({
      stars,
      count: counts[stars],
      percent: Math.round((counts[stars] / total) * 100),
    })),
  };
}

/**
 * AggregateRating (+ Review[]) sobre a Organization do site.
 * Reutiliza `${base}/#organization` do JSON-LD global (layout) para um só nó.
 *
 * Nota SEO: reviews sobre a própria organização, alojadas no site dela, são
 * "self-serving" — desde 2019 a Google não mostra estrelas para `Organization` /
 * `LocalBusiness` nesse caso. O markup mantém-se pelo valor de entidade e AEO
 * (motores de resposta), não por rich result; não vale a pena persegui-lo.
 */
export function buildReviewsSectionJsonLd(
  sectionId: string,
  reviews: ReviewJsonLdItem[],
): Record<string, unknown> | null {
  const rated = reviews.filter((r) => Number.isFinite(r.rating) && r.rating >= 1 && r.rating <= 5);
  const aggregate = computeRatingAggregate(rated);
  if (!aggregate) return null;

  const organizationId = getOrganizationId();
  const itemReviewed = { "@id": organizationId };

  return {
    "@type": "Organization",
    "@id": organizationId,
    name: getOrganizationName(),
    url: getSiteBaseUrl(),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: aggregate.average,
      reviewCount: aggregate.count,
      bestRating: 5,
      worstRating: 1,
    },
    review: rated.map((r) => ({
      "@type": "Review",
      "@id": `${getSiteBaseUrl()}/#review-${sectionId}-${r.id}`,
      itemReviewed,
      author: {
        "@type": "Person",
        name: r.authorName,
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: r.comment,
    })),
  };
}
