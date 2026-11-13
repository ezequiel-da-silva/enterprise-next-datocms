import { type AppLocale, isAppLocale } from "@/constants/i18n";

/**
 * Ajusta hrefs internos ao locale: blog (`/blog/...` → `/[locale]/blog/...`) e páginas CMS
 * (`/page-slug` → `/[locale]/page-slug`).
 */
export function localizeInternalHref(href: string, locale: AppLocale): string {
  const raw = href.trim();
  if (!raw) return "/";
  if (/^https?:\/\//i.test(raw) || raw.startsWith("//") || raw.startsWith("mailto:") || raw.startsWith("tel:") || raw.startsWith("#")) {
    return raw;
  }

  const path = raw.startsWith("/") ? raw : `/${raw}`;
  if (path === "/") return "/";

  const segments = path.split("/").filter(Boolean);
  const [first, ...rest] = segments;
  if (!first) return "/";

  if (first.startsWith("_")) {
    return path;
  }

  if (isAppLocale(first)) {
    return `/${locale}/${rest.join("/")}`.replace(/\/$/, "") || `/${locale}`;
  }

  if (first === "blog") {
    return `/${locale}/${segments.join("/")}`;
  }

  return `/${locale}/${segments.join("/")}`;
}

export function isExternalHref(href: string): boolean {
  const t = href.trim();
  return /^https?:\/\//i.test(t) || t.startsWith("//");
}

function normalizePath(path: string): string {
  const trimmed = path.trim().replace(/\/+$/, "");
  return trimmed || "/";
}

/** True when a nav link targets the same path as the header search page (Parkinson). */
export function isSearchPageHref(navItemLink: string, searchPath: string, locale: AppLocale): boolean {
  const raw = navItemLink.trim();
  if (!raw || isExternalHref(raw)) return false;
  return normalizePath(localizeInternalHref(raw, locale)) === normalizePath(searchPath);
}
