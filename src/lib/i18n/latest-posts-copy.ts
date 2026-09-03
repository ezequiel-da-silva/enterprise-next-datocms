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
  },
};

export function latestPostsCopy(locale: AppLocale): LatestPostsCopy {
  return LATEST_POSTS_COPY[locale];
}
