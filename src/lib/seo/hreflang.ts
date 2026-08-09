import {
  APP_LOCALES,
  DEFAULT_APP_LOCALE,
  appLocaleFromDato,
  type AppLocale,
  type DatoSiteLocale,
} from "@/constants/i18n";
import { getSiteBaseUrl } from "@/lib/seo/site-config";
import type { Metadata } from "next";

/** BCP 47 tags for Next.js `alternates.languages`. */
const LOCALE_HREFLANG: Record<AppLocale, string> = {
  en: "en",
  pt: "pt-BR",
  es: "es",
};

/** Entry from Dato `_all*SlugLocales { locale value }`. */
export type DatoSlugLocaleEntry = {
  locale?: string | null;
  value?: string | null;
};

function isDatoSiteLocale(value: string): value is DatoSiteLocale {
  return value === "en" || value === "pt_BR" || value === "es";
}

/**
 * Maps Dato `_all*SlugLocales` to app locales that have a non-empty slug.
 * Used so hreflang never points at 404s for untranslated records.
 */
export function appLocalesWithSlug(
  slugLocales: ReadonlyArray<DatoSlugLocaleEntry> | null | undefined,
): AppLocale[] {
  const seen = new Set<AppLocale>();
  const out: AppLocale[] = [];
  for (const entry of slugLocales ?? []) {
    const slug = entry.value?.trim();
    const raw = entry.locale?.trim();
    if (!slug || !raw || !isDatoSiteLocale(raw)) continue;
    const app = appLocaleFromDato(raw);
    if (seen.has(app)) continue;
    seen.add(app);
    out.push(app);
  }
  return out;
}

/**
 * Builds per-locale paths only for locales that have a slug in Dato.
 * Uses the locale-specific slug value (may differ across locales).
 */
export function buildHreflangPathsFromSlugLocales(
  slugLocales: ReadonlyArray<DatoSlugLocaleEntry> | null | undefined,
  pathForLocaleAndSlug: (locale: AppLocale, slug: string) => string,
): Partial<Record<AppLocale, string>> {
  const out: Partial<Record<AppLocale, string>> = {};
  for (const entry of slugLocales ?? []) {
    const slug = entry.value?.trim();
    const raw = entry.locale?.trim();
    if (!slug || !raw || !isDatoSiteLocale(raw)) continue;
    const locale = appLocaleFromDato(raw);
    out[locale] = pathForLocaleAndSlug(locale, slug);
  }
  return out;
}

/** All app locales (blog index, static listings that always exist). */
export function buildLocaleAlternatePaths(
  pathForLocale: (locale: AppLocale) => string,
  availableLocales: readonly AppLocale[] = APP_LOCALES,
): Partial<Record<AppLocale, string>> {
  const out: Partial<Record<AppLocale, string>> = {};
  for (const locale of availableLocales) {
    out[locale] = pathForLocale(locale);
  }
  return out;
}

export function buildHreflangAlternates(
  pathsByLocale: Partial<Record<AppLocale, string>>,
): NonNullable<Metadata["alternates"]> {
  const base = getSiteBaseUrl();
  const languages: Record<string, string> = {};

  for (const locale of APP_LOCALES) {
    const path = pathsByLocale[locale];
    if (!path) continue;
    const normalized = path.startsWith("/") ? path : `/${path}`;
    languages[LOCALE_HREFLANG[locale]] = new URL(normalized, base).toString();
  }

  const defaultPath =
    pathsByLocale[DEFAULT_APP_LOCALE] ??
    APP_LOCALES.map((l) => pathsByLocale[l]).find((p): p is string => Boolean(p));
  if (defaultPath) {
    const normalized = defaultPath.startsWith("/") ? defaultPath : `/${defaultPath}`;
    languages["x-default"] = new URL(normalized, base).toString();
  }

  return { languages };
}
