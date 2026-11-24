import type { AppLocale } from "@/constants/i18n";
import { interpolate } from "@/lib/i18n/merge-copy";

export type PdpCopy = {
  /** Template with `{count}` for the low-stock badge. */
  lowStockTemplate: string;
  lowStock: (count: number) => string;
  inStock: string;
  soldOut: string;
  viewImage: string;
  unavailableSuffix: string;
  checkoutTrust: string;
  /**
   * PT-only buy-box hint (PIX / installments at Shopify checkout). Empty in en/es by default;
   * editors override via `ui_string.pdp_payment_hint` without inventing rates.
   */
  paymentHint: string;
  buyNow: string;
  buying: string;
  reviewsTitle: string;
  verifiedRider: string;
  /** Template with `{average}` and `{count}` for the PDP reviews aggregate line. */
  reviewsAggregateTemplate: string;
  /** Heading of the curated PDP Q&A section (`product_page.questions`). */
  questionsTitle: string;
  specProfile: string;
  specFlex: string;
  specTerrain: string;
  specRiderLevel: string;
  specCore: string;
  sizeGuideSummary: string;
  sizeLength: string;
  sizeWeight: string;
  sizeWaist: string;
  /** Commercial + legal warranty cue under buy-box shipping/returns. */
  warrantyTrust: string;
  /** Link label to the store refund policy page. */
  refundPolicyLink: string;
  viewSpecs: string;
  viewSizeGuide: string;
  /** Shown when the PDP has no curated reviews yet. */
  reviewsEmpty: string;
};

const EN: PdpCopy = {
  lowStockTemplate: "Only {count} left in stock",
  lowStock: (count) => `Only ${count} left in stock`,
  inStock: "In stock",
  soldOut: "Sold out",
  viewImage: "View image",
  unavailableSuffix: "(sold out)",
  checkoutTrust: "Secure payment — you’ll finish on Shopify checkout.",
  paymentHint: "",
  buyNow: "Buy now",
  buying: "Opening secure checkout…",
  reviewsTitle: "Rider reviews",
  verifiedRider: "Verified rider",
  reviewsAggregateTemplate: "{average} out of 5 · {count} reviews",
  questionsTitle: "Questions & answers",
  specProfile: "Camber profile",
  specFlex: "Flex",
  specTerrain: "Recommended terrain",
  specRiderLevel: "Rider level",
  specCore: "Core material",
  sizeGuideSummary: "Size guide",
  sizeLength: "Length (cm)",
  sizeWeight: "Rider weight (kg)",
  sizeWaist: "Waist width (mm)",
  warrantyTrust: "2-year manufacturing warranty — contact us to start a claim.",
  refundPolicyLink: "Refund policy",
  viewSpecs: "View specs",
  viewSizeGuide: "Size guide",
  reviewsEmpty: "No rider reviews yet for this board.",
};

const PT: PdpCopy = {
  lowStockTemplate: "Restam apenas {count} unidades em estoque",
  lowStock: (count) => `Restam apenas ${count} unidades em estoque`,
  inStock: "Em stock",
  soldOut: "Esgotado",
  viewImage: "Ver imagem",
  unavailableSuffix: "(esgotado)",
  checkoutTrust: "Pagamento seguro — finalizas no checkout da Shopify.",
  paymentHint: "Formas de pagamento confirmadas no checkout Shopify.",
  buyNow: "Comprar agora",
  buying: "A abrir o checkout seguro…",
  reviewsTitle: "Avaliações de riders",
  verifiedRider: "Rider verificado",
  reviewsAggregateTemplate: "{average} de 5 · {count} avaliações",
  questionsTitle: "Perguntas e respostas",
  specProfile: "Perfil de curvatura",
  specFlex: "Flex",
  specTerrain: "Terreno recomendado",
  specRiderLevel: "Nível do rider",
  specCore: "Material do núcleo",
  sizeGuideSummary: "Guia de tamanhos",
  sizeLength: "Comprimento (cm)",
  sizeWeight: "Peso do rider (kg)",
  sizeWaist: "Largura da cintura (mm)",
  warrantyTrust:
    "Garantia comercial 2 anos (defeitos de fabricação) · garantia legal 90 dias — fale conosco em Contato.",
  refundPolicyLink: "Política de reembolso",
  viewSpecs: "Ver especificações",
  viewSizeGuide: "Guia de tamanhos",
  reviewsEmpty: "Ainda não há avaliações de riders para esta prancha.",
};

const ES: PdpCopy = {
  lowStockTemplate: "Quedan solo {count} unidades en stock",
  lowStock: (count) => `Quedan solo ${count} unidades en stock`,
  inStock: "En stock",
  soldOut: "Agotado",
  viewImage: "Ver imagen",
  unavailableSuffix: "(agotado)",
  checkoutTrust: "Pago seguro — terminas en el checkout de Shopify.",
  paymentHint: "",
  buyNow: "Comprar ahora",
  buying: "Abriendo el checkout seguro…",
  reviewsTitle: "Reseñas de riders",
  verifiedRider: "Rider verificado",
  reviewsAggregateTemplate: "{average} de 5 · {count} reseñas",
  questionsTitle: "Preguntas y respuestas",
  specProfile: "Perfil de curvatura",
  specFlex: "Flex",
  specTerrain: "Terreno recomendado",
  specRiderLevel: "Nivel del rider",
  specCore: "Material del núcleo",
  sizeGuideSummary: "Guía de tallas",
  sizeLength: "Largo (cm)",
  sizeWeight: "Peso del rider (kg)",
  sizeWaist: "Ancho de cintura (mm)",
  warrantyTrust: "Garantía comercial de 2 años (defectos de fabricación) — contáctanos para abrir un caso.",
  refundPolicyLink: "Política de devoluciones",
  viewSpecs: "Ver especificaciones",
  viewSizeGuide: "Guía de tallas",
  reviewsEmpty: "Aún no hay reseñas de riders para esta tabla.",
};

export const PDP_COPY: Record<AppLocale, PdpCopy> = { en: EN, pt: PT, es: ES };

const PROFILE_LABELS: Record<AppLocale, Record<string, string>> = {
  en: { camber: "Camber", rocker: "Rocker", hybrid: "Hybrid", flat: "Flat" },
  pt: { camber: "Camber", rocker: "Rocker", hybrid: "Híbrido", flat: "Flat" },
  es: { camber: "Camber", rocker: "Rocker", hybrid: "Híbrido", flat: "Flat" },
};

const TERRAIN_LABELS: Record<AppLocale, Record<string, string>> = {
  en: { all_mountain: "All-mountain", freestyle: "Freestyle", freeride: "Freeride", powder: "Powder" },
  pt: { all_mountain: "All-mountain", freestyle: "Freestyle", freeride: "Freeride", powder: "Powder" },
  es: { all_mountain: "All-mountain", freestyle: "Freestyle", freeride: "Freeride", powder: "Powder" },
};

const RIDER_LABELS: Record<AppLocale, Record<string, string>> = {
  en: { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced", expert: "Expert" },
  pt: { beginner: "Iniciante", intermediate: "Intermédio", advanced: "Avançado", expert: "Perito" },
  es: { beginner: "Principiante", intermediate: "Intermedio", advanced: "Avanzado", expert: "Experto" },
};

const BADGE_LABELS: Record<AppLocale, Record<string, string>> = {
  en: { new: "New", limited: "Limited", pro_model: "Pro model" },
  pt: { new: "Lançamento", limited: "Edição limitada", pro_model: "Modelo pro" },
  es: { new: "Novedad", limited: "Edición limitada", pro_model: "Modelo pro" },
};

export function pdpCopy(locale: AppLocale): PdpCopy {
  return PDP_COPY[locale];
}

export function resolveLowStockMessage(template: string, count: number): string {
  return interpolate(template, { count: String(count) });
}

export function resolvePdpReviewsAggregate(
  template: string,
  average: string,
  count: number,
): string {
  return interpolate(template, { average, count: String(count) });
}

/** Closed snowboard vocabulary. Unknown values become words (`all_mountain` → `all mountain`). */
export function snowboardEnumLabel(
  locale: AppLocale,
  group: "profile" | "terrain" | "rider",
  value: string | null | undefined,
): string | null {
  const raw = value?.trim();
  if (!raw) return null;
  const table = group === "profile" ? PROFILE_LABELS : group === "terrain" ? TERRAIN_LABELS : RIDER_LABELS;
  return table[locale][raw] ?? raw.replaceAll("_", " ");
}

/** Catalog marketing seal from `product_page.badge`. Unknown api keys become words. */
export function snowboardBadgeLabel(locale: AppLocale, value: string | null | undefined): string | null {
  const raw = value?.trim();
  if (!raw) return null;
  return BADGE_LABELS[locale][raw] ?? raw.replaceAll("_", " ");
}
