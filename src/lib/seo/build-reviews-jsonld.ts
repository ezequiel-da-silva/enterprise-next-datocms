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
