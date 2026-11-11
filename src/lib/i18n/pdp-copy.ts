import type { AppLocale } from "@/constants/i18n";
import { interpolate } from "@/lib/i18n/merge-copy";

export type PdpCopy = {
  /** Template with `{count}` for the low-stock badge. */
  lowStockTemplate: string;
  lowStock: (count: number) => string;
  inStock: string;
  soldOut: string;
  viewImage: string;
  unavailableSuffix: string;
  checkoutTrust: string;
  specProfile: string;
  specFlex: string;
  specTerrain: string;
  specRiderLevel: string;
  specCore: string;
  sizeGuideSummary: string;
  sizeLength: string;
  sizeWeight: string;
  sizeWaist: string;
};

const EN: PdpCopy = {
  lowStockTemplate: "Only {count} left in stock",
  lowStock: (count) => `Only ${count} left in stock`,
  inStock: "In stock",
  soldOut: "Sold out",
  viewImage: "View image",
  unavailableSuffix: "(sold out)",
  checkoutTrust: "Checkout is processed securely by Shopify.",
  specProfile: "Camber profile",
  specFlex: "Flex",
  specTerrain: "Recommended terrain",
  specRiderLevel: "Rider level",
  specCore: "Core material",
  sizeGuideSummary: "Size guide",
  sizeLength: "Length (cm)",
  sizeWeight: "Rider weight (kg)",
  sizeWaist: "Waist width (mm)",
};

const PT: PdpCopy = {
  lowStockTemplate: "Restam apenas {count} unidades em estoque",
  lowStock: (count) => `Restam apenas ${count} unidades em estoque`,
  inStock: "Em stock",
  soldOut: "Esgotado",
  viewImage: "Ver imagem",
  unavailableSuffix: "(esgotado)",
  checkoutTrust: "Checkout processado com segurança pela Shopify.",
  specProfile: "Perfil de curvatura",
  specFlex: "Flex",
  specTerrain: "Terreno recomendado",
  specRiderLevel: "Nível do rider",
  specCore: "Material do núcleo",
  sizeGuideSummary: "Guia de tamanhos",
  sizeLength: "Comprimento (cm)",
  sizeWeight: "Peso do rider (kg)",
  sizeWaist: "Largura da cintura (mm)",
};

const ES: PdpCopy = {
  lowStockTemplate: "Quedan solo {count} unidades en stock",
  lowStock: (count) => `Quedan solo ${count} unidades en stock`,
  inStock: "En stock",
  soldOut: "Agotado",
  viewImage: "Ver imagen",
  unavailableSuffix: "(agotado)",
  checkoutTrust: "El checkout se procesa de forma segura con Shopify.",
  specProfile: "Perfil de curvatura",
  specFlex: "Flex",
  specTerrain: "Terreno recomendado",
  specRiderLevel: "Nivel del rider",
  specCore: "Material del núcleo",
  sizeGuideSummary: "Guía de tallas",
  sizeLength: "Largo (cm)",
  sizeWeight: "Peso del rider (kg)",
  sizeWaist: "Ancho de cintura (mm)",
};

export const PDP_COPY: Record<AppLocale, PdpCopy> = { en: EN, pt: PT, es: ES };

const PROFILE_LABELS: Record<AppLocale, Record<string, string>> = {
  en: { camber: "Camber", rocker: "Rocker", hybrid: "Hybrid", flat: "Flat" },
  pt: { camber: "Camber", rocker: "Rocker", hybrid: "Híbrido", flat: "Flat" },
  es: { camber: "Camber", rocker: "Rocker", hybrid: "Híbrido", flat: "Flat" },
};

const TERRAIN_LABELS: Record<AppLocale, Record<string, string>> = {
  en: { all_mountain: "All-mountain", freestyle: "Freestyle", freeride: "Freeride", powder: "Powder" },
  pt: { all_mountain: "All-mountain", freestyle: "Freestyle", freeride: "Freeride", powder: "Powder" },
  es: { all_mountain: "All-mountain", freestyle: "Freestyle", freeride: "Freeride", powder: "Powder" },
};

const RIDER_LABELS: Record<AppLocale, Record<string, string>> = {
  en: { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced", expert: "Expert" },
  pt: { beginner: "Iniciante", intermediate: "Intermédio", advanced: "Avançado", expert: "Perito" },
  es: { beginner: "Principiante", intermediate: "Intermedio", advanced: "Avanzado", expert: "Experto" },
};

const BADGE_LABELS: Record<AppLocale, Record<string, string>> = {
  en: { new: "New", limited: "Limited", pro_model: "Pro model" },
  pt: { new: "Lançamento", limited: "Edição limitada", pro_model: "Modelo pro" },
  es: { new: "Novedad", limited: "Edición limitada", pro_model: "Modelo pro" },
};

export function pdpCopy(locale: AppLocale): PdpCopy {
  return PDP_COPY[locale];
}

export function resolveLowStockMessage(template: string, count: number): string {
  return interpolate(template, { count: String(count) });
}

/** Closed snowboard vocabulary. Unknown values become words (`all_mountain` → `all mountain`). */
export function snowboardEnumLabel(
  locale: AppLocale,
  group: "profile" | "terrain" | "rider",
  value: string | null | undefined,
): string | null {
  const raw = value?.trim();
  if (!raw) return null;
  const table = group === "profile" ? PROFILE_LABELS : group === "terrain" ? TERRAIN_LABELS : RIDER_LABELS;
  return table[locale][raw] ?? raw.replaceAll("_", " ");
}

/** Catalog marketing seal from `product_page.badge`. Unknown api keys become words. */
export function snowboardBadgeLabel(locale: AppLocale, value: string | null | undefined): string | null {
  const raw = value?.trim();
  if (!raw) return null;
  return BADGE_LABELS[locale][raw] ?? raw.replaceAll("_", " ");
}
