import type { AppLocale } from "@/constants/i18n";

export type ChromeCopy = {
  /** Template with `{amount}` for free-shipping threshold announcement. */
  announcementFreeShippingTemplate: string;
  /** Flat free shipping when `shippingRate === "0.00"` and no threshold. */
  announcementFreeShippingFlat: string;
  announcementReturns: string;
  footerBrandTagline: string;
  footerSecureCheckout: string;
  footerPaymentsLabel: string;
};

export const CHROME_COPY: Record<AppLocale, ChromeCopy> = {
  en: {
    announcementFreeShippingTemplate: "Free shipping from {amount}",
    announcementFreeShippingFlat: "Free shipping on all orders",
    announcementReturns: "Free returns within 30 days",
    footerBrandTagline: "Premium boards and gear for every mountain.",
    footerSecureCheckout: "Secure checkout powered by Shopify",
    footerPaymentsLabel: "Accepted payment methods",
  },
  pt: {
    announcementFreeShippingTemplate: "Frete grátis a partir de {amount}",
    announcementFreeShippingFlat: "Frete grátis em todos os pedidos",
    announcementReturns: "Devolução grátis em até 30 dias",
    footerBrandTagline: "Pranchas e equipamento premium para cada montanha.",
    footerSecureCheckout: "Checkout seguro com Shopify",
    footerPaymentsLabel: "Formas de pagamento aceitas",
  },
  es: {
    announcementFreeShippingTemplate: "Envío gratis desde {amount}",
    announcementFreeShippingFlat: "Envío gratis en todos los pedidos",
    announcementReturns: "Devoluciones gratis en 30 días",
    footerBrandTagline: "Tablas y equipo premium para cada montaña.",
    footerSecureCheckout: "Pago seguro con Shopify",
    footerPaymentsLabel: "Métodos de pago aceptados",
  },
};

export function chromeCopy(locale: AppLocale): ChromeCopy {
  return CHROME_COPY[locale];
}

export function resolveAnnouncementFreeShipping(template: string, amountLabel: string): string {
  return template.replaceAll("{amount}", amountLabel);
}
