import { Container } from "@/components/atoms/container";
import { ReviewForm } from "@/components/molecules/review-form";
import { JsonLdScriptSync } from "@/components/patterns/seo-manager";
import { DEFAULT_APP_LOCALE, type AppLocale } from "@/constants/i18n";
import type { UserReviewSubmitAction } from "@/core/entities/user-review";
import type { FileFieldLike, ReviewsSectionBlockRecord } from "@/infra/datocms/types-page";
import { readCdaArray, readCdaBool, readCdaString } from "@/lib/datocms/cda-field";
import { cmsBlockAttrs } from "@/lib/datocms/cms-block-attrs";
import { cn } from "@/lib/cn";
import { getNonce } from "@/lib/nonce";
import { buildReviewsSectionJsonLd } from "@/lib/seo/build-reviews-jsonld";
import { clampLayoutDimensions } from "@/lib/datocms-image-loader";
import Image from "next/image";

type ReviewItem = ReviewsSectionBlockRecord["reviews"][number];

function readReviews(record: ReviewsSectionBlockRecord): ReviewItem[] {
  const raw =
    record.reviews ??
    readCdaArray<ReviewItem>(record as Record<string, unknown>, "reviews", "reviews");
  return raw.filter((r): r is ReviewItem => Boolean(r?.id));
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

function StarRating({ rating, label }: { rating: number; label: string }) {
  const clamped = Math.min(5, Math.max(0, Math.round(rating)));
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={label}>
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
    </div>
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

function ReviewCard({ review }: { review: ReviewItem }) {
  const name = review.authorName?.trim() || "Anónimo";
  const rating = typeof review.rating === "number" ? review.rating : 0;
  const comment = review.comment?.trim() || "";

  return (
    <article className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-background/80 p-5 shadow-sm">
      <header className="flex items-center gap-3">
        <ReviewAvatar name={name} avatar={review.authorAvatar} />
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{name}</p>
          {rating > 0 ? <StarRating rating={rating} label={`${rating} de 5 estrelas`} /> : null}
        </div>
      </header>
      {comment ? (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{comment}</p>
      ) : null}
    </article>
  );
}

export type ReviewsSectionBlockProps = {
  record: ReviewsSectionBlockRecord;
  locale?: AppLocale;
  action?: UserReviewSubmitAction;
};

export async function ReviewsSectionBlock({
  record,
  locale = DEFAULT_APP_LOCALE,
  action,
}: ReviewsSectionBlockProps) {
  const title = readCdaString(record as Record<string, unknown>, "title", "title");
  const subtitle = readCdaString(record as Record<string, unknown>, "subtitle", "subtitle");
  const allowSubmissions = readCdaBool(
    record as Record<string, unknown>,
    "allowSubmissions",
    "allow_submissions",
  );
  const reviews = readReviews(record);
  const headingId = `reviews-section-${record.id}`;

  const jsonLd = buildReviewsSectionJsonLd(
    record.id,
    reviews
      .map((r) => ({
        id: r.id,
        authorName: r.authorName?.trim() || "Anónimo",
        rating: typeof r.rating === "number" ? r.rating : 0,
        comment: r.comment?.trim() || "",
      }))
      .filter((r) => r.rating >= 1 && r.comment),
  );
  const nonce = jsonLd ? await getNonce() : undefined;

  if (reviews.length === 0 && !allowSubmissions) {
    return null;
  }

  return (
    <section
      {...cmsBlockAttrs(record)}
      data-datocms-content-link-boundary=""
      className="not-prose my-12 w-full py-6"
      aria-labelledby={title ? headingId : undefined}
      aria-label={!title ? "Avaliações" : undefined}
    >
      {jsonLd ? <JsonLdScriptSync graph={jsonLd} nonce={nonce} /> : null}

      <Container size="lg" name="ReviewsSection" className="flex flex-col gap-10">
        {title || subtitle ? (
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
          </header>
        ) : null}

        {reviews.length > 0 ? (
          <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <li key={review.id} className="min-w-0">
                <ReviewCard review={review} />
              </li>
            ))}
          </ul>
        ) : null}

        {allowSubmissions && action ? <ReviewForm locale={locale} action={action} /> : null}
      </Container>
    </section>
  );
}
