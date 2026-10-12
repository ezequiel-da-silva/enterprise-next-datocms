import type { AppLocale } from "@/constants/i18n";

export type CartCopy = {
  title: string;
  addToCart: string;
  adding: string;
  added: string;
  viewCart: string;
  soldOut: string;
  errorGeneric: string;
  errorRateLimit: string;
  empty: string;
  continueShopping: string;
  quantity: string;
  update: string;
  remove: string;
  subtotal: string;
  checkout: string;
  checkoutNote: string;
  checkoutUnavailable: string;
  /** Accessible name for the header cart link, e.g. "Carrinho, 2 itens". */
  linkLabel: (count: number) => string;
};

export const CART_COPY: Record<AppLocale, CartCopy> = {
  en: {
    title: "Cart",
    addToCart: "Add to cart",
    adding: "Adding…",
    added: "Added to cart.",
    viewCart: "View cart",
    soldOut: "Sold out",
    errorGeneric: "Could not update the cart. Please try again.",
    errorRateLimit: "Too many attempts. Wait a minute and try again.",
    empty: "Your cart is empty.",
    continueShopping: "Continue shopping",
    quantity: "Quantity",
    update: "Update",
    remove: "Remove",
    subtotal: "Subtotal",
    checkout: "Checkout",
    checkoutNote: "Shipping and taxes are calculated at checkout.",
    checkoutUnavailable: "Checkout is temporarily unavailable.",
    linkLabel: (count) => `Cart, ${count} ${count === 1 ? "item" : "items"}`,
  },
  pt: {
    title: "Carrinho",
    addToCart: "Adicionar ao carrinho",
    adding: "Adicionando…",
    added: "Adicionado ao carrinho.",
    viewCart: "Ver carrinho",
    soldOut: "Esgotado",
    errorGeneric: "Não foi possível atualizar o carrinho. Tente novamente.",
    errorRateLimit: "Muitas tentativas. Aguarde um minuto e tente novamente.",
    empty: "Seu carrinho está vazio.",
    continueShopping: "Continuar comprando",
    quantity: "Quantidade",
    update: "Atualizar",
    remove: "Remover",
    subtotal: "Subtotal",
    checkout: "Finalizar compra",
    checkoutNote: "Frete e impostos são calculados no checkout.",
    checkoutUnavailable: "O checkout está temporariamente indisponível.",
    linkLabel: (count) => `Carrinho, ${count} ${count === 1 ? "item" : "itens"}`,
  },
  es: {
    title: "Carrito",
    addToCart: "Añadir al carrito",
    adding: "Añadiendo…",
    added: "Añadido al carrito.",
    viewCart: "Ver carrito",
    soldOut: "Agotado",
    errorGeneric: "No se pudo actualizar el carrito. Inténtalo de nuevo.",
    errorRateLimit: "Demasiados intentos. Espera un minuto e inténtalo de nuevo.",
    empty: "Tu carrito está vacío.",
    continueShopping: "Seguir comprando",
    quantity: "Cantidad",
    update: "Actualizar",
    remove: "Eliminar",
    subtotal: "Subtotal",
    checkout: "Finalizar compra",
    checkoutNote: "El envío y los impuestos se calculan en el checkout.",
    checkoutUnavailable: "El checkout no está disponible temporalmente.",
    linkLabel: (count) => `Carrito, ${count} ${count === 1 ? "artículo" : "artículos"}`,
  },
};

export function cartCopy(locale: AppLocale): CartCopy {
  return CART_COPY[locale];
}
