import type { AppLocale } from "@/constants/i18n";

export type CollectionCopy = {
  empty: string;
};

export const COLLECTION_COPY: Record<AppLocale, CollectionCopy> = {
  en: { empty: "No products found in this collection." },
  pt: { empty: "Nenhum produto encontrado nesta coleção." },
  es: { empty: "Ningún producto encontrado en esta colección." },
};

export function collectionCopy(locale: AppLocale): CollectionCopy {
  return COLLECTION_COPY[locale];
}
