"use client";

import { Button } from "@/components/atoms/button";
import { normalizeBrCep } from "@/lib/shopify/estimate-shipping";
import { useId, useState, type FormEvent } from "react";

export type ProductShippingEstimateCopy = {
  cepLabel: string;
  cepPlaceholder: string;
  submit: string;
  invalidCep: string;
  error: string;
};

type EstimateResponse = {
  free: boolean;
  rateLabel: string | null;
  etaLabel: string | null;
  disclaimer: string;
};

type ProductShippingEstimateProps = {
  locale: "pt";
  /** Selected variant price — unlocks free shipping when over threshold. */
  subtotal: number | null;
  copy: ProductShippingEstimateCopy;
};

export const SHIPPING_ESTIMATE_COPY_PT: ProductShippingEstimateCopy = {
  cepLabel: "Calcular frete",
  cepPlaceholder: "00000-000",
  submit: "Calcular",
  invalidCep: "Informe um CEP válido com 8 dígitos.",
  error: "Não foi possível estimar o frete. Tente de novo.",
};

export function ProductShippingEstimate({ locale, subtotal, copy }: ProductShippingEstimateProps) {
  const inputId = useId();
  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [result, setResult] = useState<EstimateResponse | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const normalized = normalizeBrCep(cep);
    if (!normalized) {
      setLocalError(copy.invalidCep);
      setResult(null);
      return;
    }
    setLocalError(null);
    setLoading(true);
    setResult(null);
    try {
      const params = new URLSearchParams({ locale, cep: normalized });
      if (subtotal != null && Number.isFinite(subtotal)) {
        params.set("subtotal", String(subtotal));
      }
      const res = await fetch(`/api/shipping/estimate?${params.toString()}`);
      if (!res.ok) {
        setLocalError(copy.error);
        return;
      }
      const json = (await res.json()) as EstimateResponse;
      setResult(json);
    } catch {
      setLocalError(copy.error);
    } finally {
      setLoading(false);
    }
  }

  function formatCepInput(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }

  return (
    <div className="space-y-2" data-ui-section="ProductShippingEstimate">
      <form className="flex flex-wrap items-end gap-2" onSubmit={onSubmit}>
        <div className="min-w-[10rem] flex-1 space-y-1">
          <label htmlFor={inputId} className="text-sm font-medium text-foreground">
            {copy.cepLabel}
          </label>
          <input
            id={inputId}
            name="cep"
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder={copy.cepPlaceholder}
            value={cep}
            onChange={(e) => setCep(formatCepInput(e.target.value))}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
        </div>
        <Button type="submit" variant="outline" disabled={loading} className="px-3 py-2">
          {copy.submit}
        </Button>
      </form>
      {localError ? <p className="text-sm text-destructive">{localError}</p> : null}
      {result ? (
        <div className="space-y-1 text-sm text-muted-foreground" aria-live="polite">
          <p className="font-medium text-foreground">
            {[result.rateLabel, result.etaLabel].filter(Boolean).join(" · ")}
          </p>
          <p>{result.disclaimer}</p>
        </div>
      ) : null}
    </div>
  );
}
