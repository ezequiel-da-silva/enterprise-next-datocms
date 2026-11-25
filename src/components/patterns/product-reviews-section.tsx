import type { AppLocale } from "@/constants/i18n";
import { cmsRecordAttrs } from "@/lib/datocms/cms-block-attrs";
import { cn } from "@/lib/cn";
import {
  resolvePdpReviewsAggregate,
  type PdpCopy,
} from "@/lib/i18n/pdp-copy";
import { formatRatingAverage } from "@/lib/i18n/reviews-copy";
import { buildRatingHistogram, computeRatingAggregate } from "@/lib/seo/build-reviews-jsonld";

export type ProductReviewItem = {
  id: string;
  authorName: string;
  rating: number;
  title: string | null;
  comment: string;
  verifiedRider: boolean;
  date: string | null;
  editingUrl?: string | null;
};

type ProductReviewsSectionProps = {
  locale: AppLocale;
  reviews: ProductReviewItem[];
  copy: Pick<
    PdpCopy,
    "reviewsTitle" | "verifiedRider" | "reviewsAggregateTemplate" | "reviewsEmpty"
  >;
};

function StarRating({ rating, label }: { rating: number; label?: string }) {
  const clamped = Math.min(5, Math.max(0, Math.round(rating)));
  return (
    <span
      className="inline-flex items-center gap-0.5"
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < clamped;
        return (
          <svg
            key={i}
            viewBox="0 0 20 20"
            className={cn("size-4", filled ? "text-amber-500" : "text-muted-foreground/40")}
            aria-hidden
          >
            <path
              fill="currentColor"
              d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.9 5.06 16.7l.94-5.5-4-3.9 5.53-.8L10 1.5z"
            />
          </svg>
        );
      })}
    </span>
  );
}

function VerifiedChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-0.5 text-xs font-medium text-foreground">
      <svg viewBox="0 0 16 16" className="size-3.5 text-primary" aria-hidden>
        <path
          fill="currentColor"
          d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm3.03 4.72-3.4 3.4a.75.75 0 0 1-1.06 0l-1.6-1.6a.75.75 0 1 1 1.06-1.06l1.07 1.07 2.87-2.87a.75.75 0 1 1 1.06 1.06Z"
        />
      </svg>
      {label}
    </span>
  );
}

function formatReviewDate(locale: AppLocale, raw: string | null): string | null {
  if (!raw?.trim()) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw.trim();
  const tag = locale === "pt" ? "pt-BR" : locale === "es" ? "es-ES" : "en-US";
  return new Intl.DateTimeFormat(tag, { year: "numeric", month: "short", day: "numeric" }).format(date);
}

/** Product-page curated reviews (or empty-state cue when none are published). */
export function ProductReviewsSection({ locale, reviews, copy }: ProductReviewsSectionProps) {
  const headingId = "product-reviews-heading";

  if (reviews.length === 0) {
    return (
      <section
        className="mt-12 space-y-2"
        aria-labelledby={headingId}
        data-datocms-content-link-boundary=""
      >
        <h2 id={headingId} className="type-heading">
          {copy.reviewsTitle}
        </h2>
        <p className="text-sm text-muted-foreground">{copy.reviewsEmpty}</p>
      </section>
    );
  }

  const rated = reviews
    .filter((r) => Number.isFinite(r.rating) && r.rating >= 1 && r.rating <= 5 && r.comment.trim())
    .map((r) => ({
      id: r.id,
      authorName: r.authorName,
      rating: r.rating,
      comment: r.comment,
    }));
  const aggregate = computeRatingAggregate(rated);
  const histogram = buildRatingHistogram(rated);
  const averageLabel = aggregate ? formatRatingAverage(aggregate.average, locale) : null;
  const aggregateLabel =
    aggregate && averageLabel
      ? resolvePdpReviewsAggregate(copy.reviewsAggregateTemplate, averageLabel, aggregate.count)
      : null;

  return (
    <section
      className="mt-12 space-y-6"
      aria-labelledby={headingId}
      data-datocms-content-link-boundary=""
    >
      <div className="space-y-2">
        <h2 id={headingId} className="type-heading">
          {copy.reviewsTitle}
        </h2>
        {aggregate && aggregateLabel ? (
          <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-foreground">
            <StarRating rating={aggregate.average} />
            <span>{aggregateLabel}</span>
          </p>
        ) : null}
        {histogram && reviews.length >= 3 ? (
          <ul
            className="m-0 grid max-w-sm list-none gap-1.5 p-0 pt-2"
            data-testid="rating-histogram"
          >
            {histogram.rows.map((row) => (
              <li key={row.stars} className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-3 text-sm">
                <span className="text-foreground">{row.stars} ★</span>
                <meter
                  min={0}
                  max={histogram.total}
                  value={row.count}
                  aria-label={`${row.stars} ★: ${row.count}`}
                  className="h-2 w-full"
                />
                <span className="text-right tabular-nums text-muted-foreground">{row.count}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <ul
        className={
          reviews.length === 1
            ? "m-0 grid max-w-prose list-none grid-cols-1 gap-6 p-0"
            : "m-0 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2"
        }
      >
        {reviews.map((review) => {
          const dateLabel = formatReviewDate(locale, review.date);
          return (
            <li key={review.id} className="min-w-0">
              <article
                className="flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-5 text-card-foreground"
                data-datocms-content-link-boundary=""
                {...cmsRecordAttrs({ __typename: "ProductReviewRecord", id: review.id })}
                {...(review.editingUrl
                  ? { "data-datocms-content-link-url": review.editingUrl }
                  : {})}
              >
                <header className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-medium text-card-foreground">{review.authorName}</h3>
                    {review.verifiedRider ? <VerifiedChip label={copy.verifiedRider} /> : null}
                  </div>
                  {review.rating > 0 ? (
                    <StarRating rating={review.rating} label={`${review.rating} / 5`} />
                  ) : null}
                  {review.title ? <p className="text-sm font-medium text-foreground">{review.title}</p> : null}
                  {dateLabel ? <p className="text-xs text-muted-foreground">{dateLabel}</p> : null}
                </header>
                {review.comment ? (
                  <p className="type-body whitespace-pre-wrap leading-relaxed text-foreground">
                    {review.comment}
                  </p>
                ) : null}
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
