import type { AppLocale } from "@/constants/i18n";
import { DEFAULT_APP_LOCALE, isAppLocale } from "@/constants/i18n";

/** BCP 47 / schema.org `inLanguage` (ex.: `pt-BR`). */
export function schemaLanguage(locale: AppLocale): string {
  if (locale === "en") return "en";
  if (locale === "pt") return "pt-BR";
  return "es";
}

/** Open Graph `locale` (underscore, ex.: `pt_BR`). */
export function openGraphLocale(locale: AppLocale): string {
  if (locale === "en") return "en_US";
  if (locale === "pt") return "pt_BR";
  return "es_ES";
}

/** Manifest `lang` (BCP 47). */
export function manifestLang(locale: AppLocale = DEFAULT_APP_LOCALE): string {
  return schemaLanguage(locale);
}

/** Extrai o locale do path (`/en/...` → `en`); senão o default da app. */
export function appLocaleFromPath(path: string | undefined): AppLocale {
  if (!path) return DEFAULT_APP_LOCALE;
  const segment = path.replace(/^\//, "").split("/")[0];
  return segment && isAppLocale(segment) ? segment : DEFAULT_APP_LOCALE;
}
