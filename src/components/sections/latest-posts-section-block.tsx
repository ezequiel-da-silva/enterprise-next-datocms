import { Container } from "@/components/atoms/container";
import { Skeleton } from "@/components/atoms/skeleton";
import { LatestPostsInteractive } from "@/components/sections/latest-posts-interactive";
import type { AppLocale } from "@/constants/i18n";
import type { LatestPostsCatalog, PostCardRecord, PostCategorySummary } from "@/infra/datocms/types-blog";
import type { LatestPostsSectionBlockRecord } from "@/infra/datocms/types-page";
import { readCdaString } from "@/lib/datocms/cda-field";
import { cmsBlockAttrs } from "@/lib/datocms/cms-block-attrs";
import { cn } from "@/lib/cn";
import {
  categoriesWithPosts,
  postsInCategories,
  readCategorySummariesFromRecord,
  readLatestPostCards,
  resolveLatestPostsOptions,
} from "@/lib/datocms/resolve-latest-posts-section";
import { latestPostsCopy } from "@/lib/i18n/latest-posts-copy";

type LatestPostsSectionBlockProps = {
  record: LatestPostsSectionBlockRecord;
  locale: AppLocale;
  catalog?: LatestPostsCatalog | Promise<LatestPostsCatalog>;
};

function usablePosts(posts: PostCardRecord[]): PostCardRecord[] {
  return posts.filter((post) => Boolean(post.id && post.postTitle?.trim() && post.postSlug?.trim()));
}

function usableCategories(categories: PostCategorySummary[]): PostCategorySummary[] {
  return categories.filter((category) => Boolean(category.id && category.categoryName?.trim()));
}

/** Placeholder while `allPosts`/`allCategories` resolve — keeps the H1 (LCP) unblocked. */
export function LatestPostsSectionFallback({
  locale,
  record,
}: {
  locale: AppLocale;
  record: LatestPostsSectionBlockRecord;
}) {
  const copy = latestPostsCopy(locale);
  const title = readCdaString(record as Record<string, unknown>, "title", "title");
  const subtitle = readCdaString(record as Record<string, unknown>, "subtitle", "subtitle");

  return (
    <section
      className="not-prose my-12 w-full py-6"
      aria-busy="true"
      aria-label={title || copy.sectionLabel}
    >
      <Container size="lg" name="LatestPostsSection" className="flex flex-col gap-10">
        {title || subtitle ? (
          <header className="mx-auto max-w-3xl text-center">
            {title ? (
              <h2 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p className={cn("text-base text-muted-foreground", title && "mt-2")}>{subtitle}</p>
            ) : null}
          </header>
        ) : null}
        <div className="flex flex-col gap-5 sm:gap-8">
          <div className="grid grid-cols-2 gap-2 border-b border-border/60 pb-4 sm:hidden">
            <Skeleton className="h-12 rounded-full" />
            <Skeleton className="h-12 rounded-full" />
          </div>
          <div className="hidden border-b border-border/60 pb-6 sm:block">
            <Skeleton className="h-12 w-full max-w-xl rounded-full" />
          </div>
          <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-2 lg:grid-cols-3">
            {["a", "b", "c"].map((key) => (
              <li key={key} className="min-w-0">
                <Skeleton className="aspect-video w-full rounded-xl" />
                <Skeleton className="mt-4 h-6 w-3/4" />
                <Skeleton className="mt-2 h-4 w-1/2" />
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

export async function LatestPostsSectionBlock({ record, locale, catalog }: LatestPostsSectionBlockProps) {
  const copy = latestPostsCopy(locale);
  const options = resolveLatestPostsOptions(record as Record<string, unknown>, copy.allCategories);
  const title = readCdaString(record as Record<string, unknown>, "title", "title");
  const subtitle = readCdaString(record as Record<string, unknown>, "subtitle", "subtitle");
  const resolvedCatalog = catalog ? await Promise.resolve(catalog) : undefined;

  const posts =
    options.fetchMode === "manual"
      ? readLatestPostCards(record as Record<string, unknown>, "manualPosts", "manual_posts")
      : usablePosts(resolvedCatalog?.posts ?? []);

  const categories =
    options.categoryDisplay === "selected"
      ? readCategorySummariesFromRecord(
          record as Record<string, unknown>,
          "selectedCategories",
          "selected_categories",
        )
      : options.categoryDisplay === "all"
        ? usableCategories(resolvedCatalog?.categories ?? [])
        : [];

  const dataset =
    options.categoryDisplay === "selected" ? postsInCategories(posts, categories.map((c) => c.id)) : posts;

  const chips = categoriesWithPosts(categories, dataset);

  if (dataset.length === 0 && !title && !subtitle) return null;

  const headingId = `latest-posts-${record.id}`;
  const showCategoryBar = options.categoryDisplay !== "none" && chips.length > 0;
  const headingLevel = title ? "h3" : "h2";

  return (
    <section
      {...cmsBlockAttrs(record)}
      data-datocms-content-link-boundary=""
      className="not-prose my-12 w-full py-6"
      id={options.sectionId}
      {...(title
        ? { "aria-labelledby": headingId }
        : { "aria-label": copy.sectionLabel })}
    >
      <Container size="lg" name="LatestPostsSection" className="flex flex-col gap-10">
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
              <p className={cn("text-base text-muted-foreground", title && "mt-2")}>{subtitle}</p>
            ) : null}
          </header>
        ) : null}

        <LatestPostsInteractive
          locale={locale}
          posts={dataset}
          categories={chips}
          allCategoriesLabel={options.allCategoriesLabel}
          showCategoryBar={showCategoryBar}
          showSortTabs={options.showSortTabs}
          limit={options.limit}
          headingLevel={headingLevel}
        />
      </Container>
    </section>
  );
}
