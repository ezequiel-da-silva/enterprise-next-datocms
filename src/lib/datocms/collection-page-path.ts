import type { AppLocale } from "@/constants/i18n";

export function collectionPagePath(locale: AppLocale, handle: string): string {
  return `/${locale}/collections/${handle}`;
}
