import type { AppLocale } from "@/constants/i18n";

const intlLocaleByApp: Record<AppLocale, string> = {
  en: "en-US",
  pt: "pt-BR",
  es: "es",
};

export function formatPublishedAt(appLocale: AppLocale, isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat(intlLocaleByApp[appLocale], {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}
