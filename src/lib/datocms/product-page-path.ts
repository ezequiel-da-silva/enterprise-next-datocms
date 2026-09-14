import type { AppLocale } from "@/constants/i18n";

export function productPagePath(locale: AppLocale, handle: string): string {
  return `/${locale}/products/${handle}`;
}
