export type ShippingEstimateCopy = {
  cepLabel: string;
  cepPlaceholder: string;
  submit: string;
  invalidCep: string;
  error: string;
  /** Prefix before `etaLabel` (e.g. “Prazo:”). */
  etaPrefix: string;
};

/** PT-only CEP form copy for the BR buy box (estimate is locale-gated). */
export const SHIPPING_ESTIMATE_COPY_PT: ShippingEstimateCopy = {
  cepLabel: "Calcular frete",
  cepPlaceholder: "00000-000",
  submit: "Calcular",
  invalidCep: "Informe um CEP válido com 8 dígitos.",
  error: "Não foi possível estimar o frete. Tente de novo.",
  etaPrefix: "Prazo:",
};
