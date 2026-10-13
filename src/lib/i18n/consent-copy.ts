import type { AppLocale } from "@/constants/i18n";

export type ConsentCopy = {
  title: string;
  description: string;
  acceptAll: string;
  rejectNonEssential: string;
  privacyPolicy: string;
  manage: string;
};

export const CONSENT_COPY: Record<AppLocale, ConsentCopy> = {
  en: {
    title: "Cookies on this site",
    description:
      "We use essential cookies to run the store, like your cart and sign-in. With your permission we also use analytics and marketing cookies to understand visits and improve the experience.",
    acceptAll: "Accept all",
    rejectNonEssential: "Reject non-essential",
    privacyPolicy: "Privacy policy",
    manage: "Cookie preferences",
  },
  pt: {
    title: "Cookies neste site",
    description:
      "Usamos cookies essenciais para a loja funcionar, como o carrinho e o login. Com a sua permissão, também usamos cookies de análise e marketing para entender as visitas e melhorar a experiência.",
    acceptAll: "Aceitar todos",
    rejectNonEssential: "Rejeitar não essenciais",
    privacyPolicy: "Política de privacidade",
    manage: "Preferências de cookies",
  },
  es: {
    title: "Cookies en este sitio",
    description:
      "Usamos cookies esenciales para que la tienda funcione, como el carrito y el inicio de sesión. Con tu permiso, también usamos cookies de análisis y marketing para entender las visitas y mejorar la experiencia.",
    acceptAll: "Aceptar todas",
    rejectNonEssential: "Rechazar no esenciales",
    privacyPolicy: "Política de privacidad",
    manage: "Preferencias de cookies",
  },
};

export function consentCopy(locale: AppLocale): ConsentCopy {
  return CONSENT_COPY[locale];
}
