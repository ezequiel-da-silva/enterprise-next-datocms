import { appLocaleFromParam, DEFAULT_APP_LOCALE, type AppLocale } from "@/constants/i18n";

export type ErrorCopy = {
  title: string;
  description: string;
  retry: string;
  /** Label for `error.digest`, the id that also appears in the server log line. */
  reference: string;
};

export const ERROR_COPY: Record<AppLocale, ErrorCopy> = {
  en: {
    title: "Something went wrong",
    description: "An unexpected error occurred. Try again or come back later.",
    retry: "Try again",
    reference: "Reference code",
  },
  pt: {
    title: "Algo deu errado",
    description: "Ocorreu um erro inesperado. Tente novamente ou volte mais tarde.",
    retry: "Tentar novamente",
    reference: "Código de referência",
  },
  es: {
    title: "Algo salió mal",
    description: "Se produjo un error inesperado. Inténtalo de nuevo o vuelve más tarde.",
    retry: "Intentar de nuevo",
    reference: "Código de referencia",
  },
};

/** Error boundaries get no `params`; the locale is the first path segment. */
export function errorLocaleFromPath(pathname: string | null | undefined): AppLocale {
  const first = (pathname ?? "").split("/").filter(Boolean)[0] ?? "";
  return appLocaleFromParam(first) ?? DEFAULT_APP_LOCALE;
}

export function errorCopy(locale: AppLocale): ErrorCopy {
  return ERROR_COPY[locale];
}
