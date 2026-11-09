import type { AppLocale } from "@/constants/i18n";

export type WishlistCopy = {
  title: string;
  lead: string;
  empty: string;
  continueShopping: string;
  add: string;
  remove: string;
  linkLabel: (count: number) => string;
};

export const WISHLIST_COPY: Record<AppLocale, WishlistCopy> = {
  en: {
    title: "Wishlist",
    lead: "Products you saved for later.",
    empty: "Your wishlist is empty.",
    continueShopping: "Continue shopping",
    add: "Add to wishlist",
    remove: "Remove from wishlist",
    linkLabel: (count) => (count === 1 ? "Wishlist, 1 item" : `Wishlist, ${count} items`),
  },
  pt: {
    title: "Favoritos",
    lead: "Produtos que guardaste para mais tarde.",
    empty: "A tua lista de favoritos está vazia.",
    continueShopping: "Continuar a comprar",
    add: "Adicionar aos favoritos",
    remove: "Remover dos favoritos",
    linkLabel: (count) => (count === 1 ? "Favoritos, 1 item" : `Favoritos, ${count} itens`),
  },
  es: {
    title: "Favoritos",
    lead: "Productos que guardaste para más tarde.",
    empty: "Tu lista de favoritos está vacía.",
    continueShopping: "Seguir comprando",
    add: "Añadir a favoritos",
    remove: "Quitar de favoritos",
    linkLabel: (count) => (count === 1 ? "Favoritos, 1 artículo" : `Favoritos, ${count} artículos`),
  },
};

export function wishlistCopy(locale: AppLocale): WishlistCopy {
  return WISHLIST_COPY[locale];
}

export function wishlistPath(locale: AppLocale): string {
  return `/${locale}/wishlist`;
}
