import type { AppLocale } from "@/constants/i18n";
import { interpolate } from "@/lib/i18n/merge-copy";

export type OrderConfirmationCopy = {
  title: string;
  lead: string;
  trackingNotice: string;
  orderLabelTemplate: string;
  orderLabel: (order: string) => string;
  continueShopping: string;
};

export const ORDER_CONFIRMATION_COPY: Record<AppLocale, OrderConfirmationCopy> = {
  en: {
    title: "Thank you for your order",
    lead: "We received your payment. A confirmation email is on its way from Shopify with shipping details.",
    trackingNotice: "You will receive the tracking code once the carrier ships your package.",
    orderLabelTemplate: "Order {order}",
    orderLabel: (order) => `Order ${order}`,
    continueShopping: "Continue shopping",
  },
  pt: {
    title: "Obrigado pela sua encomenda",
    lead: "Recebemos o pagamento. Em breve chega um e-mail da Shopify com os detalhes de envio.",
    trackingNotice: "Você receberá o código de rastreamento assim que o pacote for despachado pela transportadora.",
    orderLabelTemplate: "Pedido {order}",
    orderLabel: (order) => `Pedido ${order}`,
    continueShopping: "Continuar a comprar",
  },
  es: {
    title: "Gracias por tu pedido",
    lead: "Recibimos el pago. Pronto llegará un correo de Shopify con los detalles de envío.",
    trackingNotice: "Recibirás el código de seguimiento cuando el transportista envíe el paquete.",
    orderLabelTemplate: "Pedido {order}",
    orderLabel: (order) => `Pedido ${order}`,
    continueShopping: "Seguir comprando",
  },
};

export function orderConfirmationCopy(locale: AppLocale): OrderConfirmationCopy {
  return ORDER_CONFIRMATION_COPY[locale];
}

export function resolveOrderLabel(template: string, order: string): string {
  return interpolate(template, { order });
}
