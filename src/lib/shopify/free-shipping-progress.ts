export type FreeShippingProgressInput = {
  /** Cart subtotal amount (parsed float). */
  subtotal: number;
  /** Validated CMS threshold; null/≤0 means no meter. */
  threshold: number | null;
  /** Cart currency matches the market currency for this locale. */
  currencyOk: boolean;
  /** Normalized `shippingRate` (`"0.00"` = free flat rate). */
  shippingRate: string | null;
};

export type FreeShippingProgress =
  | { kind: "hidden" }
  | { kind: "simple_free" }
  | { kind: "progress"; remaining: number; ratio: number; unlocked: boolean };

/**
 * Cart free-shipping meter state. Progress only when a positive threshold exists and currencies match.
 * Flat free shipping (`shippingRate === "0.00"`) without a threshold stays a simple message (no bar).
 */
export function computeFreeShippingProgress(input: FreeShippingProgressInput): FreeShippingProgress {
  const { subtotal, threshold, currencyOk, shippingRate } = input;
  const hasThreshold =
    typeof threshold === "number" && Number.isFinite(threshold) && threshold > 0;

  if (hasThreshold && currencyOk) {
    const remaining = Math.max(0, threshold - subtotal);
    const ratio = Math.min(1, Math.max(0, subtotal / threshold));
    return {
      kind: "progress",
      remaining,
      ratio,
      unlocked: remaining <= 0,
    };
  }

  if (shippingRate === "0.00") {
    return { kind: "simple_free" };
  }

  return { kind: "hidden" };
}
