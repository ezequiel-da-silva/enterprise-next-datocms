import type { AppLocale } from "@/constants/i18n";

/** URL pública de uma Page Dato (sempre com prefixo de locale). */
export function cmsPageCanonicalPath(pageSlug: string, locale: AppLocale): string {
  if (pageSlug.toLowerCase() === "home") {
    return `/${locale}`;
  }
  return `/${locale}/${pageSlug}`;
}
