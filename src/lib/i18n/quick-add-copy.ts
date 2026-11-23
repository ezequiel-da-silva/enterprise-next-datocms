import type { AppLocale } from "@/constants/i18n";

export type QuickAddCopy = {
  /** Desktop hover CTA on the card media. */
  add: string;
  /** Accessible name for the mobile "+" control. */
  addAria: string;
  /** Drawer title while choosing a size. */
  chooseSize: string;
  close: string;
  loading: string;
  error: string;
  sizeLabel: string;
};

export const QUICK_ADD_COPY: Record<AppLocale, QuickAddCopy> = {
  en: {
    add: "Add",
    addAria: "Quick add to cart",
    chooseSize: "Choose size",
    close: "Close",
    loading: "Loading sizes…",
    error: "Could not load product options. Try again.",
    sizeLabel: "Size",
  },
  pt: {
    add: "Adicionar",
    addAria: "Adicionar ao carrinho",
    chooseSize: "Escolher tamanho",
    close: "Fechar",
    loading: "A carregar tamanhos…",
    error: "Não foi possível carregar as opções. Tente de novo.",
    sizeLabel: "Tamanho",
  },
  es: {
    add: "Añadir",
    addAria: "Añadir al carrito",
    chooseSize: "Elegir talla",
    close: "Cerrar",
    loading: "Cargando tallas…",
    error: "No se pudieron cargar las opciones. Inténtalo de nuevo.",
    sizeLabel: "Talla",
  },
};

export function quickAddCopy(locale: AppLocale): QuickAddCopy {
  return QUICK_ADD_COPY[locale];
}
