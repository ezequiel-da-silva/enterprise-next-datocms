"use client";

import { Button } from "@/components/atoms/button";
import { PostCard } from "@/components/patterns/post-card";
import type { AppLocale } from "@/constants/i18n";
import type { PostCardRecord, PostCategorySummary } from "@/infra/datocms/types-blog";
import { cn } from "@/lib/cn";
import {
  filterSortLimitPosts,
  type LatestPostsSort,
} from "@/lib/datocms/resolve-latest-posts-section";
import { latestPostsCopy } from "@/lib/i18n/latest-posts-copy";
import { useCallback, useId, useMemo, useState, type KeyboardEvent, type ReactNode } from "react";

type LatestPostsInteractiveProps = {
  locale: AppLocale;
  posts: PostCardRecord[];
  categories: PostCategorySummary[];
  allCategoriesLabel: string;
  showCategoryBar: boolean;
  showSortTabs: boolean;
  limit: number;
  headingLevel: "h2" | "h3";
};

const SORTS: LatestPostsSort[] = ["newest", "oldest", "popular"];

const ALL_CATEGORIES_VALUE = "__all";

const CARD_SIZES = "(max-width: 767px) calc(100vw - 2rem), (max-width: 1023px) 50vw, 360px";

export function LatestPostsInteractive({
  locale,
  posts,
  categories,
  allCategoriesLabel,
  showCategoryBar,
  showSortTabs,
  limit,
  headingLevel,
}: LatestPostsInteractiveProps) {
  const copy = latestPostsCopy(locale);
  const reactId = useId().replace(/:/g, "");
  const listId = `latest-posts-list-${reactId}`;
  const sortPrefix = `latest-posts-sort-${reactId}`;
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [sort, setSort] = useState<LatestPostsSort>("newest");

  const visible = useMemo(
    () => filterSortLimitPosts(posts, categoryId, sort, limit),
    [posts, categoryId, sort, limit],
  );

  const onSortKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      const current = SORTS.indexOf(sort);
      if (current < 0) return;
      let nextIndex = current;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        nextIndex = (current + 1) % SORTS.length;
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        nextIndex = (current - 1 + SORTS.length) % SORTS.length;
      } else {
        return;
      }
      const next = SORTS[nextIndex]!;
      setSort(next);
      requestAnimationFrame(() => document.getElementById(`${sortPrefix}-${next}`)?.focus());
    },
    [sort, sortPrefix],
  );

  return (
    <div className="flex flex-col gap-5 sm:gap-8">
      {showCategoryBar || showSortTabs ? (
        <div className="border-b border-border/60 pb-4 sm:pb-6">
          <div
            className={cn(
              "grid gap-2 sm:hidden",
              showCategoryBar && showSortTabs ? "grid-cols-2" : "grid-cols-1",
            )}
          >
            {showCategoryBar ? (
              <FilterSelect
                label={copy.categoryGroup}
                name="category"
                value={categoryId ?? ALL_CATEGORIES_VALUE}
                onChange={(value) => setCategoryId(value === ALL_CATEGORIES_VALUE ? null : value)}
              >
                <option value={ALL_CATEGORIES_VALUE}>{allCategoriesLabel}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.categoryName}
                  </option>
                ))}
              </FilterSelect>
            ) : null}

            {showSortTabs ? (
              <FilterSelect
                label={copy.sortGroup}
                name="sort"
                value={sort}
                onChange={(value) => setSort(value as LatestPostsSort)}
              >
                {SORTS.map((value) => (
                  <option key={value} value={value}>
                    {copy[value]}
                  </option>
                ))}
              </FilterSelect>
            ) : null}
          </div>

          <div className="hidden sm:flex sm:flex-col sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
            {showCategoryBar && categories.length > 0 ? (
              <div
                role="group"
                aria-label={copy.categoryGroup}
                className="flex flex-wrap items-center gap-2"
              >
                <CategoryChip
                  pressed={categoryId === null}
                  onPress={() => setCategoryId(null)}
                  label={allCategoriesLabel}
                />
                {categories.map((category) => (
                  <CategoryChip
                    key={category.id}
                    pressed={categoryId === category.id}
                    onPress={() => setCategoryId(category.id)}
                    label={category.categoryName}
                    colorHex={category.categoryColor?.hex}
                  />
                ))}
              </div>
            ) : null}

            {showSortTabs ? (
              <div
                role="radiogroup"
                aria-label={copy.sortGroup}
                aria-controls={listId}
                className="inline-flex w-fit shrink-0 items-center gap-1 rounded-full border border-border bg-muted/60 p-1"
              >
                {SORTS.map((value) => (
                  <SortChip
                    key={value}
                    id={`${sortPrefix}-${value}`}
                    pressed={sort === value}
                    onPress={() => setSort(value)}
                    onKeyDown={onSortKeyDown}
                    label={copy[value]}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div id={listId}>
        <p className="sr-only" aria-live="polite">
          {visible.length === 0 ? copy.empty : copy.results(visible.length)}
        </p>

        {visible.length === 0 ? (
          <p
            className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground sm:px-6 sm:py-10"
            aria-hidden
          >
            {copy.empty}
          </p>
        ) : (
          <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((post) => (
              <li key={post.id} className="min-w-0">
                <PostCard post={post} locale={locale} headingLevel={headingLevel} sizes={CARD_SIZES} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const CHIP_BASE = "touch-target-text gap-2 rounded-full px-4 text-sm font-medium whitespace-nowrap";

/** Abaixo de `sm` os filtros viram dois selects nativos lado a lado (picker do SO). */
function FilterSelect({
  label,
  name,
  value,
  onChange,
  children,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  const selectId = `latest-posts-${name}-${useId().replace(/:/g, "")}`;

  return (
    <div className="relative min-w-0">
      <select
        id={selectId}
        name={name}
        aria-label={label}
        className="filter-select min-h-12 w-full cursor-pointer appearance-none items-center truncate rounded-full border border-border bg-background py-2 pl-4 pr-9 text-sm font-medium text-foreground shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      >
        <path d="m6 8 4 4 4-4" />
      </svg>
    </div>
  );
}

function CategoryChip({
  pressed,
  onPress,
  label,
  colorHex,
}: {
  pressed: boolean;
  onPress: () => void;
  label: string;
  colorHex?: string;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      className={cn(
        CHIP_BASE,
        pressed
          ? "border-primary bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
          : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:bg-muted hover:text-foreground",
      )}
      aria-pressed={pressed}
      onClick={onPress}
    >
      {colorHex ? (
        <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden className="shrink-0">
          <circle cx="4" cy="4" r="4" fill={colorHex} />
        </svg>
      ) : null}
      {label}
    </Button>
  );
}

function SortChip({
  id,
  pressed,
  onPress,
  onKeyDown,
  label,
}: {
  id: string;
  pressed: boolean;
  onPress: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  label: string;
}) {
  return (
    <Button
      id={id}
      type="button"
      variant="ghost"
      className={cn(
        CHIP_BASE,
        pressed
          ? "bg-background text-foreground shadow-sm ring-1 ring-border hover:bg-background"
          : "text-muted-foreground hover:bg-transparent hover:text-foreground",
      )}
      role="radio"
      aria-checked={pressed}
      tabIndex={pressed ? 0 : -1}
      onClick={onPress}
      onKeyDown={onKeyDown}
    >
      {label}
    </Button>
  );
}
