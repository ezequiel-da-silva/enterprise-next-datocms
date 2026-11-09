import type { AppLocale } from "@/constants/i18n";

export type OrderConfirmationCopy = {
  title: string;
  lead: string;
  orderLabel: (order: string) => string;
  continueShopping: string;
};

export const ORDER_CONFIRMATION_COPY: Record<AppLocale, OrderConfirmationCopy> = {
  en: {
    title: "Thank you for your order",
    lead: "We received your payment. A confirmation email is on its way from Shopify with shipping details.",
    orderLabel: (order) => `Order ${order}`,
    continueShopping: "Continue shopping",
  },
  pt: {
    title: "Obrigado pela sua encomenda",
    lead: "Recebemos o pagamento. Em breve chega um e-mail da Shopify com os detalhes de envio.",
    orderLabel: (order) => `Pedido ${order}`,
    continueShopping: "Continuar a comprar",
  },
  es: {
    title: "Gracias por tu pedido",
    lead: "Recibimos el pago. Pronto llegará un correo de Shopify con los detalles de envío.",
    orderLabel: (order) => `Pedido ${order}`,
    continueShopping: "Seguir comprando",
  },
};

export function orderConfirmationCopy(locale: AppLocale): OrderConfirmationCopy {
  return ORDER_CONFIRMATION_COPY[locale];
}
