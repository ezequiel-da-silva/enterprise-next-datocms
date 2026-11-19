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
  /** Suffix after the unit price, e.g. "R$ 139,00 cada". */
  each: string;
  update: string;
  remove: string;
  subtotal: string;
  checkout: string;
  checkoutNote: string;
  checkoutUnavailable: string;
  /** Close the quick-cart drawer (dialog dismiss control). */
  closeDrawer: string;
  /** Template with `{amount}` for free-shipping progress under threshold. */
  freeShippingRemainingTemplate: string;
  freeShippingRemaining: (amountLabel: string) => string;
  /** Shown when cart subtotal meets `free_shipping_threshold`. */
  freeShippingUnlocked: string;
  /** Recently viewed products heading (empty cart / PDP). */
  recentlyViewedTitle: string;
  /** Accessible name for the header cart link, e.g. "Carrinho, 2 itens". */
  linkLabel: (count: number) => string;
};

function freeShippingRemainingFrom(template: string, amountLabel: string): string {
  return template.replaceAll("{amount}", amountLabel);
}

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
    each: "each",
    update: "Update",
    remove: "Remove",
    subtotal: "Subtotal",
    checkout: "Checkout",
    checkoutNote: "Shipping and taxes are calculated at checkout.",
    checkoutUnavailable: "Checkout is temporarily unavailable.",
    closeDrawer: "Close cart",
    freeShippingRemainingTemplate: "Add {amount} more for free shipping",
    freeShippingRemaining: (amount) => freeShippingRemainingFrom("Add {amount} more for free shipping", amount),
    freeShippingUnlocked: "You've unlocked free shipping",
    recentlyViewedTitle: "Recently viewed",
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
    each: "cada",
    update: "Atualizar",
    remove: "Remover",
    subtotal: "Subtotal",
    checkout: "Finalizar compra",
    checkoutNote: "Frete e impostos são calculados no checkout.",
    checkoutUnavailable: "O checkout está temporariamente indisponível.",
    closeDrawer: "Fechar carrinho",
    freeShippingRemainingTemplate: "Faltam {amount} para frete grátis",
    freeShippingRemaining: (amount) => freeShippingRemainingFrom("Faltam {amount} para frete grátis", amount),
    freeShippingUnlocked: "Frete grátis desbloqueado",
    recentlyViewedTitle: "Vistos recentemente",
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
    each: "c/u",
    update: "Actualizar",
    remove: "Eliminar",
    subtotal: "Subtotal",
    checkout: "Finalizar compra",
    checkoutNote: "El envío y los impuestos se calculan en el checkout.",
    checkoutUnavailable: "El checkout no está disponible temporalmente.",
    closeDrawer: "Cerrar carrito",
    freeShippingRemainingTemplate: "Faltan {amount} para envío gratis",
    freeShippingRemaining: (amount) => freeShippingRemainingFrom("Faltan {amount} para envío gratis", amount),
    freeShippingUnlocked: "Envío gratis desbloqueado",
    recentlyViewedTitle: "Vistos recientemente",
    linkLabel: (count) => `Carrito, ${count} ${count === 1 ? "artículo" : "artículos"}`,
  },
};

export function cartCopy(locale: AppLocale): CartCopy {
  return CART_COPY[locale];
}

export function resolveFreeShippingRemaining(template: string, amountLabel: string): string {
  return freeShippingRemainingFrom(template, amountLabel);
}
