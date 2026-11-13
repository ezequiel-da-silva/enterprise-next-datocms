import type { AppLocale } from "@/constants/i18n";
import { interpolate } from "@/lib/i18n/merge-copy";

export type CatalogFiltersCopy = {
  clearFilters: string;
  inStockOnly: string;
  sortLabel: string;
  sortRelevance: string;
  sortPriceAsc: string;
  sortPriceDesc: string;
  /** Template with `{count}` for the results line. */
  resultsTemplate: string;
  filtersEmpty: string;
  terrainLabel: string;
  profileLabel: string;
  /** Accessible name for the active-filters chip bar. */
  activeFiltersLabel: string;
  /** Aside / drawer title. */
  filtersLabel: string;
  /** Mobile toolbar button that opens the filter drawer. */
  openFiltersLabel: string;
  /** Close control for the mobile filter drawer. */
  closeFiltersLabel: string;
};

const EN: CatalogFiltersCopy = {
  clearFilters: "Clear all",
  inStockOnly: "In stock only",
  sortLabel: "Sort by",
  sortRelevance: "Relevance",
  sortPriceAsc: "Price: low to high",
  sortPriceDesc: "Price: high to low",
  resultsTemplate: "{count} results",
  filtersEmpty: "No boards match these filters. Try clearing one or more.",
  terrainLabel: "Terrain",
  profileLabel: "Profile",
  activeFiltersLabel: "Active filters",
  filtersLabel: "Filters",
  openFiltersLabel: "Filter",
  closeFiltersLabel: "Close filters",
};

const PT: CatalogFiltersCopy = {
  clearFilters: "Limpar tudo",
  inStockOnly: "Só em stock",
  sortLabel: "Ordenar por",
  sortRelevance: "Relevância",
  sortPriceAsc: "Preço: menor para maior",
  sortPriceDesc: "Preço: maior para menor",
  resultsTemplate: "{count} resultados",
  filtersEmpty: "Nenhuma prancha corresponde a estes filtros. Experimente limpar um ou mais.",
  terrainLabel: "Terreno",
  profileLabel: "Perfil",
  activeFiltersLabel: "Filtros activos",
  filtersLabel: "Filtros",
  openFiltersLabel: "Filtrar",
  closeFiltersLabel: "Fechar filtros",
};

const ES: CatalogFiltersCopy = {
  clearFilters: "Borrar todo",
  inStockOnly: "Solo en stock",
  sortLabel: "Ordenar por",
  sortRelevance: "Relevancia",
  sortPriceAsc: "Precio: de menor a mayor",
  sortPriceDesc: "Precio: de mayor a menor",
  resultsTemplate: "{count} resultados",
  filtersEmpty: "Ninguna tabla coincide con estos filtros. Prueba a borrar uno o más.",
  terrainLabel: "Terreno",
  profileLabel: "Perfil",
  activeFiltersLabel: "Filtros activos",
  filtersLabel: "Filtros",
  openFiltersLabel: "Filtrar",
  closeFiltersLabel: "Cerrar filtros",
};

export const CATALOG_FILTERS_COPY: Record<AppLocale, CatalogFiltersCopy> = {
  en: EN,
  pt: PT,
  es: ES,
};

export function catalogFiltersCopy(locale: AppLocale): CatalogFiltersCopy {
  return CATALOG_FILTERS_COPY[locale];
}

export function resolveCatalogResultsLabel(template: string, count: number): string {
  return interpolate(template, { count: String(count) });
}
