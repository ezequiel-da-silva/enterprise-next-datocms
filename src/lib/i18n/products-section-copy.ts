import type { AppLocale } from "@/constants/i18n";

export type ProductsSectionCopy = {
  sectionLabel: string;
  empty: string;
  results: (count: number) => string;
  loadMore: string;
  pagination: string;
  page: (page: number, total: number) => string;
  previousPage: string;
  nextPage: string;
  carousel: string;
  roleDescription: string;
  slideRoleDescription: string;
  previousSlide: string;
  nextSlide: string;
  goToSlide: (slide: number) => string;
  pause: string;
  play: string;
  reducedMotion: string;
};

export const PRODUCTS_SECTION_COPY: Record<AppLocale, ProductsSectionCopy> = {
  en: {
    sectionLabel: "Products",
    empty: "No products to show.",
    results: (count) => (count === 1 ? "1 product" : `${count} products`),
    loadMore: "Load more products",
    pagination: "Products pagination",
    page: (page, total) => `Page ${page} of ${total}`,
    previousPage: "Previous page",
    nextPage: "Next page",
    carousel: "Products carousel",
    roleDescription: "carousel",
    slideRoleDescription: "slide",
    previousSlide: "Previous products",
    nextSlide: "Next products",
    goToSlide: (slide) => `Go to slide ${slide}`,
    pause: "Pause carousel",
    play: "Play carousel",
    reducedMotion: "Autoplay is off because reduced motion is enabled.",
  },
  pt: {
    sectionLabel: "Produtos",
    empty: "Nenhum produto para mostrar.",
    results: (count) => (count === 1 ? "1 produto" : `${count} produtos`),
    loadMore: "Carregar mais produtos",
    pagination: "Paginação de produtos",
    page: (page, total) => `Página ${page} de ${total}`,
    previousPage: "Página anterior",
    nextPage: "Página seguinte",
    carousel: "Carrossel de produtos",
    roleDescription: "carrossel",
    slideRoleDescription: "diapositivo",
    previousSlide: "Produtos anteriores",
    nextSlide: "Produtos seguintes",
    goToSlide: (slide) => `Ir para o diapositivo ${slide}`,
    pause: "Pausar carrossel",
    play: "Reproduzir carrossel",
    reducedMotion: "A reprodução automática está desligada porque o movimento reduzido está ativo.",
  },
  es: {
    sectionLabel: "Productos",
    empty: "Ningún producto para mostrar.",
    results: (count) => (count === 1 ? "1 producto" : `${count} productos`),
    loadMore: "Cargar más productos",
    pagination: "Paginación de productos",
    page: (page, total) => `Página ${page} de ${total}`,
    previousPage: "Página anterior",
    nextPage: "Página siguiente",
    carousel: "Carrusel de productos",
    roleDescription: "carrusel",
    slideRoleDescription: "diapositiva",
    previousSlide: "Productos anteriores",
    nextSlide: "Productos siguientes",
    goToSlide: (slide) => `Ir a la diapositiva ${slide}`,
    pause: "Pausar carrusel",
    play: "Reproducir carrusel",
    reducedMotion: "La reproducción automática está desactivada porque el movimiento reducido está activo.",
  },
};

export function productsSectionCopy(locale: AppLocale): ProductsSectionCopy {
  return PRODUCTS_SECTION_COPY[locale];
}
