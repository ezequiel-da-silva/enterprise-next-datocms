/** Definido no proxy (`src/proxy.ts`) a partir do primeiro segmento da URL (fallback: default). */
export const REQUEST_LOCALE_HEADER = "x-nd-locale";

/** Locales expostos na URL como primeiro segmento (`/en/...`, `/pt/...` — partilha `[slug]` com páginas CMS). */
export type AppLocale = "en" | "pt" | "es";

export const APP_LOCALES: AppLocale[] = ["en", "pt", "es"];

export const DEFAULT_APP_LOCALE: AppLocale = "en";

/** Valores do enum `SiteLocale` do DatoCMS (GraphQL). */
export type DatoSiteLocale = "en" | "pt_BR" | "es";

const APP_TO_DATO: Record<AppLocale, DatoSiteLocale> = {
  en: "en",
  pt: "pt_BR",
  es: "es",
};

const DATO_TO_APP: Record<DatoSiteLocale, AppLocale> = {
  en: "en",
  pt_BR: "pt",
  es: "es",
};

export function isAppLocale(value: string): value is AppLocale {
  return (APP_LOCALES as string[]).includes(value);
}

export function toDatoSiteLocale(app: AppLocale): DatoSiteLocale {
  return APP_TO_DATO[app];
}

export function appLocaleFromDato(site: DatoSiteLocale): AppLocale {
  return DATO_TO_APP[site];
}

export function appLocaleFromParam(param: string): AppLocale | null {
  return isAppLocale(param) ? param : null;
}
