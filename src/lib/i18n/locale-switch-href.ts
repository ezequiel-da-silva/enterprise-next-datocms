import { APP_LOCALES, isAppLocale, type AppLocale } from "@/constants/i18n";
import { cmsPageCanonicalPath } from "@/lib/datocms/cms-page-path";
import { collectionPagePath } from "@/lib/datocms/collection-page-path";
import { productPagePath } from "@/lib/datocms/product-page-path";
import { readSearchQuery } from "@/lib/datocms/search-query";
import { homeBreadcrumbPath } from "@/lib/seo/breadcrumb-labels";
import type { DatoSlugLocaleEntry } from "@/lib/seo/hreflang";
import { buildHreflangPathsFromSlugLocales } from "@/lib/seo/hreflang";

/** Rotas da app (não Dato) com o mesmo segmento em todos os locales: `/{locale}/account`, `/{locale}/cart`. */
const APP_ROUTE_SEGMENTS = ["account", "cart"] as const;

export type AppRouteSegment = (typeof APP_ROUTE_SEGMENTS)[number];

function isAppRouteSegment(value: string): value is AppRouteSegment {
  return (APP_ROUTE_SEGMENTS as readonly string[]).includes(value);
}

export type LocalePathKind =
  | { kind: "home" }
  | { kind: "app"; segment: AppRouteSegment }
  | { kind: "blog" }
  | { kind: "post"; slug: string }
  | { kind: "author"; slug: string }
  | { kind: "category"; slug: string }
  | { kind: "cms"; slug: string }
  | { kind: "product"; handle: string }
  | { kind: "collection"; handle: string }
  | { kind: "other" };

export function normalizeSwitcherPathname(pathname: string): string {
  const noQuery = pathname.split("?")[0]?.split("#")[0] ?? "/";
  const withSlash = noQuery.startsWith("/") ? noQuery : `/${noQuery}`;
  if (withSlash.length > 1 && withSlash.endsWith("/")) {
    return withSlash.slice(0, -1);
  }
  return withSlash || "/";
}

export function parseLocalePath(pathname: string): LocalePathKind {
  const path = normalizeSwitcherPathname(pathname);
  const segments = path.split("/").filter(Boolean);
  const [first, ...rest] = segments;

  if (!first) return { kind: "home" };

  if (isAppLocale(first)) {
    return parseAfterLocale(rest);
  }

  if (first === "blog") {
    return parseBlogRest(rest);
  }

  if (rest.length === 0) {
    return { kind: "cms", slug: first };
  }

  return { kind: "other" };
}

function parseAfterLocale(rest: string[]): LocalePathKind {
  if (rest.length === 0) return { kind: "home" };
  const [second, ...tail] = rest;
  if (!second) return { kind: "home" };
  if (second.toLowerCase() === "home" && tail.length === 0) return { kind: "home" };
  if (second === "blog") return parseBlogRest(tail);
  if (tail.length === 0 && isAppRouteSegment(second)) return { kind: "app", segment: second };
  if (tail.length === 0) return { kind: "cms", slug: second };
  if (tail.length === 1 && tail[0]) {
    if (second === "products") return { kind: "product", handle: tail[0] };
    if (second === "collections") return { kind: "collection", handle: tail[0] };
  }
  return { kind: "other" };
}

function parseBlogRest(rest: string[]): LocalePathKind {
  if (rest.length === 0) return { kind: "blog" };
  const [a, b] = rest;
  if (!a) return { kind: "blog" };
  if (a === "author" && b) return { kind: "author", slug: b };
  if (a === "category" && b) return { kind: "category", slug: b };
  if (rest.length === 1) return { kind: "post", slug: a };
  return { kind: "other" };
}

/**
 * Whitelist: só paths relativos `/{locale}[/segmento…]`. Slugs vêm do CMS, por isso
 * um valor com `/`, `\`, `?`, `#`, `@`, `%` ou `:` podia produzir `//host`, query
 * injection ou `javascript:` (open redirect).
 */
export function isSafeLocalePath(path: string, expected?: AppLocale): boolean {
  if (!path.startsWith("/") || path.startsWith("//")) return false;
  if (/[\\\s?#@%]/i.test(path)) return false;

  const [first, ...rest] = path.slice(1).split("/");
  if (!first || !isAppLocale(first)) return false;
  if (expected && first !== expected) return false;

  return rest.every((segment) => segment.length > 0 && segment !== "." && segment !== ".." && !segment.includes(":"));
}

function homeHrefs(): Record<AppLocale, string> {
  const out = {} as Record<AppLocale, string>;
  for (const locale of APP_LOCALES) {
    out[locale] = homeBreadcrumbPath(locale);
  }
  return out;
}

function completeHrefs(partial: Partial<Record<AppLocale, string>>): Record<AppLocale, string> {
  const out = homeHrefs();
  for (const locale of APP_LOCALES) {
    const path = partial[locale];
    if (path && isSafeLocalePath(path, locale)) out[locale] = path;
  }
  return out;
}

/** Hrefs do seletor: tradução quando existe; senão a home do locale. */
export function buildLocaleSwitcherHrefs(
  pathname: string,
  slugPaths?: Partial<Record<AppLocale, string>>,
): Record<AppLocale, string> {
  const kind = parseLocalePath(pathname);

  if (kind.kind === "home" || kind.kind === "other") {
    return homeHrefs();
  }

  if (kind.kind === "blog") {
    return completeHrefs(
      Object.fromEntries(APP_LOCALES.map((locale) => [locale, `/${locale}/blog`])) as Record<
        AppLocale,
        string
      >,
    );
  }

  if (kind.kind === "app") {
    return completeHrefs(
      Object.fromEntries(APP_LOCALES.map((locale) => [locale, `/${locale}/${kind.segment}`])) as Record<
        AppLocale,
        string
      >,
    );
  }

  if (kind.kind === "product" || kind.kind === "collection") {
    const toPath = kind.kind === "product" ? productPagePath : collectionPagePath;
    return completeHrefs(
      Object.fromEntries(APP_LOCALES.map((locale) => [locale, toPath(locale, kind.handle)])) as Record<
        AppLocale,
        string
      >,
    );
  }

  return completeHrefs(slugPaths ?? {});
}

export function hrefForLocale(
  pathname: string,
  target: AppLocale,
  slugPaths?: Partial<Record<AppLocale, string>>,
): string {
  return buildLocaleSwitcherHrefs(pathname, slugPaths)[target];
}

export function slugPathsFromCmsLocales(
  slugLocales: ReadonlyArray<DatoSlugLocaleEntry> | null | undefined,
): Partial<Record<AppLocale, string>> {
  return buildHreflangPathsFromSlugLocales(slugLocales, (locale, slug) =>
    cmsPageCanonicalPath(slug, locale),
  );
}

export function slugPathsFromBlogRecord(
  kind: "post" | "author" | "category",
  slugLocales: ReadonlyArray<DatoSlugLocaleEntry> | null | undefined,
): Partial<Record<AppLocale, string>> {
  const prefix =
    kind === "post" ? "" : kind === "author" ? "author/" : "category/";
  return buildHreflangPathsFromSlugLocales(
    slugLocales,
    (locale, slug) => `/${locale}/blog/${prefix}${slug}`,
  );
}

/** Preserva `?q=` nos hrefs do seletor (página de busca). */
export function appendLocaleSwitcherSearch(
  hrefs: Record<AppLocale, string>,
  query?: string | null,
): Record<AppLocale, string> {
  const q = readSearchQuery(query);
  if (!q) return hrefs;
  const params = new URLSearchParams();
  params.set("q", q);
  const suffix = `?${params.toString()}`;
  const out = { ...hrefs };
  for (const locale of APP_LOCALES) {
    out[locale] = `${hrefs[locale]}${suffix}`;
  }
  return out;
}
