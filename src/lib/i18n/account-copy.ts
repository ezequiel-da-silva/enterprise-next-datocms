import type { AppLocale } from "@/constants/i18n";

export type AccountErrorCode = "login" | "rate" | "unavailable";

export type AccountCopy = {
  title: string;
  description: string;
  signedOutIntro: string;
  signIn: string;
  signOut: string;
  greeting: (name: string | null) => string;
  ordersTitle: string;
  noOrders: string;
  viewOrder: string;
  /** Opens in a new tab (Shopify order status page). */
  viewOrderHint: string;
  loadError: string;
  errors: Record<AccountErrorCode, string>;
  /** Shopify `OrderFinancialStatus` labels; unknown values fall back to the raw enum. */
  financialStatus: Record<string, string>;
  /** Accessible name for the header link. */
  linkLabel: (signedIn: boolean) => string;
};

export const ACCOUNT_COPY: Record<AppLocale, AccountCopy> = {
  en: {
    title: "My account",
    description: "Your profile and orders.",
    signedOutIntro: "Sign in to see your orders and check out faster.",
    signIn: "Sign in",
    signOut: "Sign out",
    greeting: (name) => (name ? `Hello, ${name}` : "Hello"),
    ordersTitle: "Recent orders",
    noOrders: "You have no orders yet.",
    viewOrder: "View order",
    viewOrderHint: "(opens in a new tab)",
    loadError: "We could not load your account. Please sign in again.",
    errors: {
      login: "Sign-in did not complete. Please try again.",
      rate: "Too many attempts. Wait a minute and try again.",
      unavailable: "Sign-in is temporarily unavailable.",
    },
    financialStatus: {
      PAID: "Paid",
      PENDING: "Pending",
      AUTHORIZED: "Authorized",
      PARTIALLY_PAID: "Partially paid",
      PARTIALLY_REFUNDED: "Partially refunded",
      REFUNDED: "Refunded",
      VOIDED: "Voided",
      EXPIRED: "Expired",
    },
    linkLabel: (signedIn) => (signedIn ? "My account" : "Sign in"),
  },
  pt: {
    title: "Minha conta",
    description: "Seu perfil e seus pedidos.",
    signedOutIntro: "Entre para ver seus pedidos e finalizar compras mais rápido.",
    signIn: "Entrar",
    signOut: "Sair",
    greeting: (name) => (name ? `Olá, ${name}` : "Olá"),
    ordersTitle: "Pedidos recentes",
    noOrders: "Você ainda não tem pedidos.",
    viewOrder: "Ver pedido",
    viewOrderHint: "(abre em nova aba)",
    loadError: "Não foi possível carregar sua conta. Entre novamente.",
    errors: {
      login: "O login não foi concluído. Tente novamente.",
      rate: "Muitas tentativas. Aguarde um minuto e tente novamente.",
      unavailable: "O login está temporariamente indisponível.",
    },
    financialStatus: {
      PAID: "Pago",
      PENDING: "Pendente",
      AUTHORIZED: "Autorizado",
      PARTIALLY_PAID: "Parcialmente pago",
      PARTIALLY_REFUNDED: "Parcialmente reembolsado",
      REFUNDED: "Reembolsado",
      VOIDED: "Cancelado",
      EXPIRED: "Expirado",
    },
    linkLabel: (signedIn) => (signedIn ? "Minha conta" : "Entrar"),
  },
  es: {
    title: "Mi cuenta",
    description: "Tu perfil y tus pedidos.",
    signedOutIntro: "Inicia sesión para ver tus pedidos y pagar más rápido.",
    signIn: "Iniciar sesión",
    signOut: "Cerrar sesión",
    greeting: (name) => (name ? `Hola, ${name}` : "Hola"),
    ordersTitle: "Pedidos recientes",
    noOrders: "Todavía no tienes pedidos.",
    viewOrder: "Ver pedido",
    viewOrderHint: "(se abre en una pestaña nueva)",
    loadError: "No pudimos cargar tu cuenta. Inicia sesión de nuevo.",
    errors: {
      login: "El inicio de sesión no se completó. Inténtalo de nuevo.",
      rate: "Demasiados intentos. Espera un minuto e inténtalo de nuevo.",
      unavailable: "El inicio de sesión no está disponible temporalmente.",
    },
    financialStatus: {
      PAID: "Pagado",
      PENDING: "Pendiente",
      AUTHORIZED: "Autorizado",
      PARTIALLY_PAID: "Pagado parcialmente",
      PARTIALLY_REFUNDED: "Reembolsado parcialmente",
      REFUNDED: "Reembolsado",
      VOIDED: "Anulado",
      EXPIRED: "Vencido",
    },
    linkLabel: (signedIn) => (signedIn ? "Mi cuenta" : "Iniciar sesión"),
  },
};

export function accountCopy(locale: AppLocale): AccountCopy {
  return ACCOUNT_COPY[locale];
}

export function isAccountErrorCode(value: string | undefined): value is AccountErrorCode {
  return value === "login" || value === "rate" || value === "unavailable";
}
