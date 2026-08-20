import { getOrganizationName, getSiteBaseUrl } from "@/lib/seo/site-config";

export type ReviewJsonLdItem = {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
};

/**
 * AggregateRating (+ Review[]) sobre a Organization do site.
 * Google só aceita este schema em Product / LocalBusiness / Organization —
 * não usar o título da secção CMS como `name`.
 */
export function buildReviewsSectionJsonLd(
  sectionId: string,
  reviews: ReviewJsonLdItem[],
): Record<string, unknown> | null {
  const rated = reviews.filter((r) => Number.isFinite(r.rating) && r.rating >= 1 && r.rating <= 5);
  if (rated.length === 0) return null;

  const sum = rated.reduce((acc, r) => acc + r.rating, 0);
  const avg = Math.round((sum / rated.length) * 10) / 10;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${getSiteBaseUrl()}/#organization-reviews-${sectionId}`,
    name: getOrganizationName(),
    url: getSiteBaseUrl(),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: avg,
      reviewCount: rated.length,
      bestRating: 5,
      worstRating: 1,
    },
    review: rated.map((r) => ({
      "@type": "Review",
      "@id": `https://schema.org/Review/${r.id}`,
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
