import { APP_LOCALES, DEFAULT_APP_LOCALE, isAppLocale, type AppLocale } from "@/constants/i18n";

/** Nome do idioma no próprio idioma (seletor — bandeiras representam países). */
export const LOCALE_NATIVE_NAME: Record<AppLocale, string> = {
  en: "English",
  pt: "Português",
  es: "Español",
};

/** Código curto no trigger do seletor (largura fixa, sem CLS). */
export const LOCALE_SHORT_CODE: Record<AppLocale, string> = {
  en: "EN",
  pt: "PT",
  es: "ES",
};

/** BCP 47 / schema.org `inLanguage` (ex.: `pt-BR`). */
export function schemaLanguage(locale: AppLocale): string {
  if (locale === "en") return "en";
  if (locale === "pt") return "pt-BR";
  return "es";
}

/** Todos os BCP 47 da app — `WebSite.inLanguage` / `availableLanguage`. */
export function schemaLanguages(): string[] {
  return APP_LOCALES.map(schemaLanguage);
}

/** Open Graph `locale` (underscore, ex.: `pt_BR`). */
export function openGraphLocale(locale: AppLocale): string {
  if (locale === "en") return "en_US";
  if (locale === "pt") return "pt_BR";
  return "es_ES";
}

/** `og:locale:alternate` só para locales com path hreflang (nunca aponta a 404). */
export function openGraphAlternateLocales(
  current: AppLocale,
  hreflangPaths?: Partial<Record<AppLocale, string>>,
): string[] | undefined {
  if (!hreflangPaths) return undefined;
  const alts = APP_LOCALES.filter((locale) => locale !== current && Boolean(hreflangPaths[locale])).map(
    openGraphLocale,
  );
  return alts.length > 0 ? alts : undefined;
}

export function languageNavLabel(locale: AppLocale): string {
  return locale === "en" ? "Language" : "Idioma";
}

/** WCAG 2.5.3: o código visível no botão tem de estar no nome acessível. */
export function localeSwitcherTriggerLabel(locale: AppLocale, shortCode: string): string {
  return `${languageNavLabel(locale)}: ${shortCode}`;
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
