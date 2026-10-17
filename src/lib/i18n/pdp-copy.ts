import type { AppLocale } from "@/constants/i18n";
import { interpolate } from "@/lib/i18n/merge-copy";

export type PdpCopy = {
  /** Template with `{count}` for the low-stock badge. */
  lowStockTemplate: string;
  lowStock: (count: number) => string;
};

export const PDP_COPY: Record<AppLocale, PdpCopy> = {
  en: {
    lowStockTemplate: "Only {count} left in stock",
    lowStock: (count) => `Only ${count} left in stock`,
  },
  pt: {
    lowStockTemplate: "Restam apenas {count} unidades em estoque",
    lowStock: (count) => `Restam apenas ${count} unidades em estoque`,
  },
  es: {
    lowStockTemplate: "Quedan solo {count} unidades en stock",
    lowStock: (count) => `Quedan solo ${count} unidades en stock`,
  },
};

export function pdpCopy(locale: AppLocale): PdpCopy {
  return PDP_COPY[locale];
}

export function resolveLowStockMessage(template: string, count: number): string {
  return interpolate(template, { count: String(count) });
}
