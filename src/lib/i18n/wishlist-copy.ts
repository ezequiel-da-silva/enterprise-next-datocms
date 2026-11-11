import type { AppLocale } from "@/constants/i18n";

export type WishlistCopy = {
  title: string;
  lead: string;
  emptyTitle: string;
  emptyDescription: string;
  emptyCta: string;
  add: string;
  remove: string;
  linkLabel: (count: number) => string;
};

/** Serializable subset for client components (no functions). */
export type WishlistViewCopy = Pick<
  WishlistCopy,
  "emptyTitle" | "emptyDescription" | "emptyCta" | "add" | "remove" | "lead"
>;

export const WISHLIST_COPY: Record<AppLocale, WishlistCopy> = {
  en: {
    title: "Wishlist",
    lead: "Products you saved for later.",
    emptyTitle: "Your wishlist is empty",
    emptyDescription: "Save boards you like and find them here later.",
    emptyCta: "Explore boards",
    add: "Add to wishlist",
    remove: "Remove from wishlist",
    linkLabel: (count) => (count === 1 ? "Wishlist, 1 item" : `Wishlist, ${count} items`),
  },
  pt: {
    title: "Favoritos",
    lead: "Produtos que guardaste para mais tarde.",
    emptyTitle: "Sua lista de desejos está vazia",
    emptyDescription: "Guarda as pranchas que gostares e encontra-as aqui mais tarde.",
    emptyCta: "Explorar pranchas",
    add: "Adicionar aos favoritos",
    remove: "Remover dos favoritos",
    linkLabel: (count) => (count === 1 ? "Favoritos, 1 item" : `Favoritos, ${count} itens`),
  },
  es: {
    title: "Favoritos",
    lead: "Productos que guardaste para más tarde.",
    emptyTitle: "Tu lista de deseos está vacía",
    emptyDescription: "Guarda las tablas que te gusten y encuéntralas aquí más tarde.",
    emptyCta: "Explorar tablas",
    add: "Añadir a favoritos",
    remove: "Quitar de favoritos",
    linkLabel: (count) => (count === 1 ? "Favoritos, 1 artículo" : `Favoritos, ${count} artículos`),
  },
};

export function wishlistCopy(locale: AppLocale): WishlistCopy {
  return WISHLIST_COPY[locale];
}

export function toWishlistViewCopy(copy: WishlistCopy): WishlistViewCopy {
  return {
    lead: copy.lead,
    emptyTitle: copy.emptyTitle,
    emptyDescription: copy.emptyDescription,
    emptyCta: copy.emptyCta,
    add: copy.add,
    remove: copy.remove,
  };
}

export function wishlistPath(locale: AppLocale): string {
  return `/${locale}/wishlist`;
}
