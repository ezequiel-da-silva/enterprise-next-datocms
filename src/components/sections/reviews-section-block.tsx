import { Container } from "@/components/atoms/container";
import { ReviewFormLazy } from "@/components/molecules/review-form-lazy";
import { JsonLdScriptSync } from "@/components/patterns/seo-manager";
import type { AppLocale } from "@/constants/i18n";
import type { UserReviewSubmitAction } from "@/core/entities/user-review";
import type { FileFieldLike, ReviewsSectionBlockRecord } from "@/infra/datocms/types-page";
import { readCdaArray, readCdaBool, readCdaString } from "@/lib/datocms/cda-field";
import { cmsBlockAttrs } from "@/lib/datocms/cms-block-attrs";
import { cn } from "@/lib/cn";
import { formatRatingAverage, reviewsCopy } from "@/lib/i18n/reviews-copy";
import { getNonce } from "@/lib/nonce";
import {
  buildReviewsSectionJsonLd,
  computeRatingAggregate,
  type ReviewJsonLdItem,
} from "@/lib/seo/build-reviews-jsonld";
import { clampLayoutDimensions } from "@/lib/datocms-image-loader";
import Image from "next/image";

type ReviewItem = ReviewsSectionBlockRecord["reviews"][number];

/** Corte defensivo: o campo `reviews` do CMS não tem máximo. */
const MAX_REVIEWS = 24;

type ParsedReview = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  avatar: FileFieldLike | null;
};

function readReviews(record: ReviewsSectionBlockRecord, anonymous: string): ParsedReview[] {
  const raw =
    record.reviews ??
    readCdaArray<ReviewItem>(record as Record<string, unknown>, "reviews", "reviews");

  const parsed: ParsedReview[] = [];
  for (const item of raw) {
    if (!item?.id) continue;
    const name = item.authorName?.trim() ?? "";
    const comment = item.comment?.trim() ?? "";
    /* Sem nome e sem texto o card fica vazio — não vale a pena ocupar uma coluna. */
    if (!name && !comment) continue;
    parsed.push({
      id: item.id,
      name: name || anonymous,
      rating: typeof item.rating === "number" ? item.rating : 0,
      comment,
      avatar: item.authorAvatar ?? null,
    });
    if (parsed.length >= MAX_REVIEWS) break;
  }
  return parsed;
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

/**
 * `label` só quando as estrelas são a única pista; ao lado de texto equivalente ficam decorativas.
 * Root em `span` para poder viver dentro do `<p>` do agregado sem HTML inválido.
 */
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

function ReviewAvatar({ name, avatar }: { name: string; avatar?: FileFieldLike | null }) {
  if (avatar?.url) {
    const w = avatar.width ?? 96;
    const h = avatar.height ?? 96;
    const layout = clampLayoutDimensions(w, h);
    return (
      <span className="relative inline-flex size-12 shrink-0 overflow-hidden rounded-full bg-muted">
        <Image
          src={avatar.url}
          alt=""
          width={layout.width}
          height={layout.height}
          sizes="48px"
          className="h-full w-full object-cover"
        />
      </span>
    );
  }

  return (
    <span
      aria-hidden
      className="inline-flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-semibold text-muted-foreground"
    >
      {initialsFromName(name)}
    </span>
  );
}

function ReviewCard({ review, starsLabel }: { review: ParsedReview; starsLabel: string }) {
  return (
    <article className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm">
      <header className="flex items-center gap-3">
        <ReviewAvatar name={review.name} avatar={review.avatar} />
        <div className="min-w-0">
          <p className="truncate font-medium text-card-foreground">{review.name}</p>
          {review.rating > 0 ? <StarRating rating={review.rating} label={starsLabel} /> : null}
        </div>
      </header>
      {review.comment ? (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {review.comment}
        </p>
      ) : null}
    </article>
  );
}

export type ReviewsSectionBlockProps = {
  record: ReviewsSectionBlockRecord;
  locale: AppLocale;
  action?: UserReviewSubmitAction;
};

export async function ReviewsSectionBlock({ record, locale, action }: ReviewsSectionBlockProps) {
  const copy = reviewsCopy(locale);
  const title = readCdaString(record as Record<string, unknown>, "title", "title");
  const subtitle = readCdaString(record as Record<string, unknown>, "subtitle", "subtitle");
  const allowSubmissions = readCdaBool(
    record as Record<string, unknown>,
    "allowSubmissions",
    "allow_submissions",
  );
  const reviews = readReviews(record, copy.anonymous);

  if (reviews.length === 0 && !allowSubmissions) {
    return null;
  }

  const headingId = `reviews-section-${record.id}`;
  /* Mesma lista para o texto visível e para o JSON-LD: a Google exige que a média marcada apareça na página. */
  const ratedReviews: ReviewJsonLdItem[] = reviews
    .map((r) => ({ id: r.id, authorName: r.name, rating: r.rating, comment: r.comment }))
    .filter((r) => r.rating >= 1 && r.comment);
  const aggregate = computeRatingAggregate(ratedReviews);
  const jsonLd = buildReviewsSectionJsonLd(record.id, ratedReviews);
  const nonce = jsonLd ? await getNonce() : undefined;
  const aggregateLabel = aggregate
    ? copy.aggregateLabel(formatRatingAverage(aggregate.average, locale), aggregate.count)
    : null;

  return (
    <section
      {...cmsBlockAttrs(record)}
      data-datocms-content-link-boundary=""
      className="not-prose my-12 w-full py-6"
      aria-labelledby={title ? headingId : undefined}
      aria-label={!title ? copy.sectionLabel : undefined}
    >
      {jsonLd ? <JsonLdScriptSync graph={jsonLd} nonce={nonce} /> : null}

      <Container size="lg" name="ReviewsSection" className="flex flex-col gap-10">
        {title || subtitle || aggregateLabel ? (
          <header className="mx-auto max-w-3xl text-center">
            {title ? (
              <h2
                id={headingId}
                className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
              >
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p className={cn("text-base text-muted-foreground", title ? "mt-2" : "mt-0")}>
                {subtitle}
              </p>
            ) : null}
            {aggregate && aggregateLabel ? (
              <p
                className={cn(
                  "flex flex-wrap items-center justify-center gap-2 text-sm font-medium text-foreground",
                  title || subtitle ? "mt-4" : "mt-0",
                )}
              >
                <StarRating rating={aggregate.average} />
                <span>{aggregateLabel}</span>
              </p>
            ) : null}
          </header>
        ) : null}

        {reviews.length > 0 ? (
          <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <li key={review.id} className="min-w-0">
                <ReviewCard review={review} starsLabel={copy.starsLabel(review.rating)} />
              </li>
            ))}
          </ul>
        ) : null}

        {allowSubmissions && action ? <ReviewFormLazy locale={locale} action={action} /> : null}
      </Container>
    </section>
  );
}
