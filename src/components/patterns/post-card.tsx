import { DatoResponsivePicture } from "@/components/patterns/dato-responsive-picture";
import type { AppLocale } from "@/constants/i18n";
import { formatPublishedAt } from "@/lib/blog/format-published-at";
import type { PostCardRecord } from "@/infra/datocms/types-blog";
import Link from "next/link";

type PostCardProps = {
  post: PostCardRecord;
  locale: AppLocale;
};

export function PostCard({ post, locale }: PostCardProps) {
  const href = `/${locale}/blog/${post.postSlug}`;
  const cover = post.coverImage;
  const mobile = cover?.asset;
  const desktop = cover?.assetDesktop;
  const primaryCategory = post.postCategory[0];
  const dateLabel = formatPublishedAt(locale, post._firstPublishedAt);
  const colorHex = primaryCategory?.categoryColor?.hex;

  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm ring-1 ring-border/40 transition hover:border-primary/25 hover:shadow-md">
      <Link
        href={href}
        className="block rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          {mobile?.url ? (
            <DatoResponsivePicture
              mobile={mobile}
              desktop={desktop}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, 480px"
              fallbackAlt={post.postTitle}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">Sem capa</div>
          )}
          {primaryCategory ? (
            <div className="absolute left-3 top-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur">
                {colorHex ? (
                  <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden className="shrink-0">
                    <circle cx="5" cy="5" r="5" fill={colorHex} />
                  </svg>
                ) : null}
                {primaryCategory.categoryName}
              </span>
            </div>
          ) : null}
          <div className="absolute bottom-3 left-3 rounded-md bg-background/85 px-2 py-1 text-xs text-muted-foreground backdrop-blur">
            <time dateTime={post._firstPublishedAt}>{dateLabel}</time>
          </div>
        </div>
        <div className="space-y-2 p-4">
          <h2 className="text-balance text-lg font-semibold tracking-tight text-foreground group-hover:text-primary">{post.postTitle}</h2>
          {post.postAuthor?.authorName ? (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground/90">{post.postAuthor.authorName}</span>
            </p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
