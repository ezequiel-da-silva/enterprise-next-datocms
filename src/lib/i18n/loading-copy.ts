import { DEFAULT_APP_LOCALE, appLocaleFromParam, type AppLocale } from "@/constants/i18n";

/** Screen-reader text announced while a route segment streams in (`loading.tsx`). */
export const LOADING_COPY: Record<AppLocale, string> = {
  en: "Loading…",
  pt: "Carregando…",
  es: "Cargando…",
};

/** `loading.tsx` gets no params; the `[slug]` segment value comes from `useParams()` (may be missing or an array). */
export function loadingLabelFor(slug: string | string[] | undefined): string {
  const value = Array.isArray(slug) ? slug[0] : slug;
  return LOADING_COPY[(value && appLocaleFromParam(value)) || DEFAULT_APP_LOCALE];
}
