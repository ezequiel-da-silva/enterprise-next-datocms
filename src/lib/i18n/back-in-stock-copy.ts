import type { AppLocale } from "@/constants/i18n";

export type BackInStockCopy = {
  title: string;
  emailLabel: string;
  emailPlaceholder: string;
  submit: string;
  submitting: string;
  success: string;
  errorGeneric: string;
  errorEmail: string;
  errorRateLimit: string;
};

export const BACK_IN_STOCK_COPY: Record<AppLocale, BackInStockCopy> = {
  en: {
    title: "Notify me when available",
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    submit: "Notify me",
    submitting: "Saving…",
    success: "Thanks — we’ll email you when this size is back.",
    errorGeneric: "Could not save your request. Please try again.",
    errorEmail: "Enter a valid email address.",
    errorRateLimit: "Too many attempts. Wait a minute and try again.",
  },
  pt: {
    title: "Avise-me quando chegar",
    emailLabel: "E-mail",
    emailPlaceholder: "voce@exemplo.com",
    submit: "Avisar-me",
    submitting: "A guardar…",
    success: "Obrigado — enviamos um e-mail quando este tamanho voltar.",
    errorGeneric: "Não foi possível guardar o pedido. Tente novamente.",
    errorEmail: "Indique um e-mail válido.",
    errorRateLimit: "Muitas tentativas. Aguarde um minuto e tente novamente.",
  },
  es: {
    title: "Avísame cuando esté disponible",
    emailLabel: "Correo",
    emailPlaceholder: "tu@ejemplo.com",
    submit: "Avisarme",
    submitting: "Guardando…",
    success: "Gracias — te escribiremos cuando vuelva esta talla.",
    errorGeneric: "No se pudo guardar la solicitud. Inténtalo de nuevo.",
    errorEmail: "Introduce un correo válido.",
    errorRateLimit: "Demasiados intentos. Espera un minuto e inténtalo de nuevo.",
  },
};

export function backInStockCopy(locale: AppLocale): BackInStockCopy {
  return BACK_IN_STOCK_COPY[locale];
}
