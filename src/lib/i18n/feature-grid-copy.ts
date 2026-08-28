import type { AppLocale } from "@/constants/i18n";

/**
 * Copy do Feature GRID (secção + carrossel) por locale.
 * Módulo puro: o bloco é RSC e o carousel é cliente — ambos importam daqui.
 */
export type FeatureGridCopy = {
  sectionLabel: string;
  roleDescription: string;
  slideRoleDescription: string;
  previous: string;
  next: string;
  pause: string;
  play: string;
  reducedMotion: string;
  slide: (current: number, total: number) => string;
  goTo: (current: number) => string;
};

export const FEATURE_GRID_COPY: Record<AppLocale, FeatureGridCopy> = {
  en: {
    sectionLabel: "Features",
    roleDescription: "carousel",
    slideRoleDescription: "slide",
    previous: "Previous slide",
    next: "Next slide",
    pause: "Pause carousel",
    play: "Play carousel",
    reducedMotion: "Autoplay disabled by reduced motion preference",
    slide: (current, total) => `Slide ${current} of ${total}`,
    goTo: (current) => `Go to slide ${current}`,
  },
  pt: {
    sectionLabel: "Recursos",
    roleDescription: "carrossel",
    slideRoleDescription: "slide",
    previous: "Slide anterior",
    next: "Próximo slide",
    pause: "Pausar carrossel",
    play: "Reproduzir carrossel",
    reducedMotion: "Reprodução automática desativada pela preferência de movimento reduzido",
    slide: (current, total) => `Slide ${current} de ${total}`,
    goTo: (current) => `Ir para o slide ${current}`,
  },
  es: {
    sectionLabel: "Características",
    roleDescription: "carrusel",
    slideRoleDescription: "diapositiva",
    previous: "Diapositiva anterior",
    next: "Diapositiva siguiente",
    pause: "Pausar carrusel",
    play: "Reproducir carrusel",
    reducedMotion: "Reproducción automática desactivada por la preferencia de movimiento reducido",
    slide: (current, total) => `Diapositiva ${current} de ${total}`,
    goTo: (current) => `Ir a la diapositiva ${current}`,
  },
};
