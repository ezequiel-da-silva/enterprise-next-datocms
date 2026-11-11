import type { AppLocale } from "@/constants/i18n";
import { interpolate } from "@/lib/i18n/merge-copy";

export type ProductsSectionCopy = {
  sectionLabel: string;
  empty: string;
  results: (count: number) => string;
  loadMore: string;
  pagination: string;
  /** Template with `{current}` and `{total}`. */
  pageOfTemplate: string;
  page: (page: number, total: number) => string;
  previousPage: string;
  nextPage: string;
  carousel: string;
  roleDescription: string;
  slideRoleDescription: string;
  previousSlide: string;
  nextSlide: string;
  goToSlide: (slide: number) => string;
  position: (slide: number, total: number) => string;
  pause: string;
  play: string;
  reducedMotion: string;
};

/** CMS-overridable strings safe to pass into client components. */
export type ProductsSectionCmsCopy = {
  empty: string;
  pageOfTemplate: string;
};

function withPage(base: Omit<ProductsSectionCopy, "page">): ProductsSectionCopy {
  return {
    ...base,
    page: (page, total) => resolveProductsPageOf(base.pageOfTemplate, page, total),
  };
}

export function resolveProductsPageOf(template: string, current: number, total: number): string {
  return interpolate(template, { current, total });
}

export const PRODUCTS_SECTION_COPY: Record<AppLocale, ProductsSectionCopy> = {
  en: withPage({
    sectionLabel: "Products",
    empty: "No products available right now.",
    results: (count) => (count === 1 ? "1 product" : `${count} products`),
    loadMore: "Load more products",
    pagination: "Products pagination",
    pageOfTemplate: "Page {current} of {total}",
    previousPage: "Previous page",
    nextPage: "Next page",
    carousel: "Products carousel",
    roleDescription: "carousel",
    slideRoleDescription: "slide",
    previousSlide: "Previous products",
    nextSlide: "Next products",
    goToSlide: (slide) => `Go to slide ${slide}`,
    position: (slide, total) => `${slide} / ${total}`,
    pause: "Pause carousel",
    play: "Play carousel",
    reducedMotion: "Autoplay is off because reduced motion is enabled.",
  }),
  pt: withPage({
    sectionLabel: "Produtos",
    empty: "Nenhum produto disponível no momento.",
    results: (count) => (count === 1 ? "1 produto" : `${count} produtos`),
    loadMore: "Carregar mais produtos",
    pagination: "Paginação de produtos",
    pageOfTemplate: "Página {current} de {total}",
    previousPage: "Página anterior",
    nextPage: "Página seguinte",
    carousel: "Carrossel de produtos",
    roleDescription: "carrossel",
    slideRoleDescription: "diapositivo",
    previousSlide: "Produtos anteriores",
    nextSlide: "Produtos seguintes",
    goToSlide: (slide) => `Ir para o diapositivo ${slide}`,
    position: (slide, total) => `${slide} / ${total}`,
    pause: "Pausar carrossel",
    play: "Reproduzir carrossel",
    reducedMotion: "A reprodução automática está desligada porque o movimento reduzido está ativo.",
  }),
  es: withPage({
    sectionLabel: "Productos",
    empty: "Ningún producto disponible en este momento.",
    results: (count) => (count === 1 ? "1 producto" : `${count} productos`),
    loadMore: "Cargar más productos",
    pagination: "Paginación de productos",
    pageOfTemplate: "Página {current} de {total}",
    previousPage: "Página anterior",
    nextPage: "Página siguiente",
    carousel: "Carrusel de productos",
    roleDescription: "carrusel",
    slideRoleDescription: "diapositiva",
    previousSlide: "Productos anteriores",
    nextSlide: "Productos siguientes",
    goToSlide: (slide) => `Ir a la diapositiva ${slide}`,
    position: (slide, total) => `${slide} / ${total}`,
    pause: "Pausar carrusel",
    play: "Reproducir carrusel",
    reducedMotion: "La reproducción automática está desactivada porque el movimiento reducido está activo.",
  }),
};

export function productsSectionCopy(locale: AppLocale): ProductsSectionCopy {
  return PRODUCTS_SECTION_COPY[locale];
}
