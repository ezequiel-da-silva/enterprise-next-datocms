import type { AppLocale } from "@/constants/i18n";

export type ThemeCopy = {
  activateLight: string;
  activateDark: string;
};

export const THEME_COPY: Record<AppLocale, ThemeCopy> = {
  en: {
    activateLight: "Switch to light theme",
    activateDark: "Switch to dark theme",
  },
  pt: {
    activateLight: "Ativar tema claro",
    activateDark: "Ativar tema escuro",
  },
  es: {
    activateLight: "Activar tema claro",
    activateDark: "Activar tema oscuro",
  },
};

export function themeCopy(locale: AppLocale): ThemeCopy {
  return THEME_COPY[locale];
}
