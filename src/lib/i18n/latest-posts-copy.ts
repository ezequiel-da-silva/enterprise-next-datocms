import type { AppLocale } from "@/constants/i18n";

/**
 * Copy da Blog posts section (chips, ordenação, estados vazios).
 * Módulo puro: o bloco é RSC e a ilha de filtros é cliente.
 */
export type LatestPostsCopy = {
  sectionLabel: string;
  allCategories: string;
  sortGroup: string;
  newest: string;
  oldest: string;
  popular: string;
  categoryGroup: string;
  empty: string;
  results: (count: number) => string;
  loadMore: string;
  pagination: string;
  page: (page: number, total: number) => string;
  previousPage: string;
  nextPage: string;
  carousel: string;
  previousSlide: string;
  nextSlide: string;
  goToSlide: (slide: number) => string;
  pause: string;
  play: string;
  reducedMotion: string;
};

export const LATEST_POSTS_COPY: Record<AppLocale, LatestPostsCopy> = {
  en: {
    sectionLabel: "Blog posts",
    allCategories: "All",
    sortGroup: "Sort posts",
    newest: "Newest",
    oldest: "Oldest",
    popular: "Popular",
    categoryGroup: "Filter by category",
    empty: "No posts to show.",
    results: (count) => (count === 1 ? "1 post" : `${count} posts`),
    loadMore: "Load more posts",
    pagination: "Posts pagination",
    page: (page, total) => `Page ${page} of ${total}`,
    previousPage: "Previous page",
    nextPage: "Next page",
    carousel: "Blog posts carousel",
    previousSlide: "Previous posts",
    nextSlide: "Next posts",
    goToSlide: (slide) => `Go to slide ${slide}`,
    pause: "Pause carousel",
    play: "Play carousel",
    reducedMotion: "Autoplay disabled due to reduced motion preference",
  },
  pt: {
    sectionLabel: "Artigos",
    allCategories: "Todas",
    sortGroup: "Ordenar artigos",
    newest: "Mais recentes",
    oldest: "Mais antigos",
    popular: "Populares",
    categoryGroup: "Filtrar por categoria",
    empty: "Nenhum artigo para mostrar.",
    results: (count) => (count === 1 ? "1 artigo" : `${count} artigos`),
    loadMore: "Carregar mais artigos",
    pagination: "Paginação de artigos",
    page: (page, total) => `Página ${page} de ${total}`,
    previousPage: "Página anterior",
    nextPage: "Próxima página",
    carousel: "Carrossel de artigos",
    previousSlide: "Artigos anteriores",
    nextSlide: "Próximos artigos",
    goToSlide: (slide) => `Ir para o slide ${slide}`,
    pause: "Pausar carrossel",
    play: "Reproduzir carrossel",
    reducedMotion: "Autoplay desativado pela preferência de movimento reduzido",
  },
  es: {
    sectionLabel: "Artículos",
    allCategories: "Todas",
    sortGroup: "Ordenar artículos",
    newest: "Más recientes",
    oldest: "Más antiguos",
    popular: "Populares",
    categoryGroup: "Filtrar por categoría",
    empty: "No hay artículos para mostrar.",
    results: (count) => (count === 1 ? "1 artículo" : `${count} artículos`),
    loadMore: "Cargar más artículos",
    pagination: "Paginación de artículos",
    page: (page, total) => `Página ${page} de ${total}`,
    previousPage: "Página anterior",
    nextPage: "Página siguiente",
    carousel: "Carrusel de artículos",
    previousSlide: "Artículos anteriores",
    nextSlide: "Artículos siguientes",
    goToSlide: (slide) => `Ir a la diapositiva ${slide}`,
    pause: "Pausar carrusel",
    play: "Reproducir carrusel",
    reducedMotion: "Reproducción automática desactivada por la preferencia de movimiento reducido",
  },
};

export function latestPostsCopy(locale: AppLocale): LatestPostsCopy {
  return LATEST_POSTS_COPY[locale];
}
