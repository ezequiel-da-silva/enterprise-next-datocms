import { APP_LOCALES, DEFAULT_APP_LOCALE, type AppLocale } from "@/constants/i18n";
import { getSiteBaseUrl } from "@/lib/seo/site-config";
import type { Metadata } from "next";

/** BCP 47 tags for Next.js `alternates.languages`. */
const LOCALE_HREFLANG: Record<AppLocale, string> = {
  en: "en",
  pt: "pt-BR",
  es: "es",
};

export function buildLocaleAlternatePaths(
  pathForLocale: (locale: AppLocale) => string,
): Partial<Record<AppLocale, string>> {
  const out: Partial<Record<AppLocale, string>> = {};
  for (const locale of APP_LOCALES) {
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

  const defaultPath = pathsByLocale[DEFAULT_APP_LOCALE];
  if (defaultPath) {
    const normalized = defaultPath.startsWith("/") ? defaultPath : `/${defaultPath}`;
    languages["x-default"] = new URL(normalized, base).toString();
  }

  return { languages };
}
