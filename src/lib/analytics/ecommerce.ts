export type Ga4Item = {
  item_id: string;
  item_name: string;
  price?: number;
  quantity?: number;
  item_variant?: string;
};

/** Alias used by the client funnel helpers (`begin_checkout`, `remove_from_cart`, `view_item_list`). */
export type EcommerceItem = Ga4Item;

export type ViewItemListPayload = {
  item_list_id?: string;
  item_list_name?: string;
  items: EcommerceItem[];
};

export type EcommercePayload = {
  currency: string;
  value: number;
  items: Ga4Item[];
};

export type PurchasePayload = EcommercePayload & {
  transaction_id: string;
};

type Gtag = (...args: unknown[]) => void;

type Env = Record<string, string | undefined>;

function normalizeCurrency(currency: string | null | undefined): string {
  const trimmed = currency?.trim();
  return trimmed && trimmed.length > 0 ? trimmed.toUpperCase() : "USD";
}

function gtagSafe(...args: unknown[]): void {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof gtag !== "function") return;
  gtag(...args);
}

function withNormalizedPayload(payload: EcommercePayload): EcommercePayload {
  return {
    currency: normalizeCurrency(payload.currency),
    value: payload.value,
    items: payload.items,
  };
}

/** GA4 `view_item` — no-op without browser gtag (SSR or pre-consent). */
export function trackViewItem(payload: EcommercePayload): void {
  gtagSafe("event", "view_item", withNormalizedPayload(payload));
}

/** GA4 `add_to_cart` — no-op without browser gtag (SSR or pre-consent). */
export function trackAddToCart(payload: EcommercePayload): void {
  gtagSafe("event", "add_to_cart", withNormalizedPayload(payload));
}

/** GA4 `begin_checkout` — no-op without browser gtag (SSR or pre-consent). */
export function trackBeginCheckout(payload: EcommercePayload): void {
  gtagSafe("event", "begin_checkout", withNormalizedPayload(payload));
}

/** GA4 `remove_from_cart` — no-op without browser gtag (SSR or pre-consent). */
export function trackRemoveFromCart(payload: EcommercePayload): void {
  gtagSafe("event", "remove_from_cart", withNormalizedPayload(payload));
}

/** GA4 `view_item_list` — no-op without browser gtag (SSR or pre-consent). */
export function trackViewItemList(payload: ViewItemListPayload): void {
  gtagSafe("event", "view_item_list", {
    ...(payload.item_list_id ? { item_list_id: payload.item_list_id } : {}),
    ...(payload.item_list_name ? { item_list_name: payload.item_list_name } : {}),
    items: payload.items,
  });
}

/** GA4 `purchase` (browser) — no-op without gtag. Prefer Measurement Protocol for headless checkout. */
export function trackPurchase(payload: PurchasePayload): void {
  const normalized = withNormalizedPayload(payload);
  gtagSafe("event", "purchase", {
    ...normalized,
    transaction_id: payload.transaction_id.trim(),
  });
}

export type MeasurementProtocolResult =
  | { ok: true; skipped?: undefined }
  | { ok: true; skipped: true; reason: "missing_config" | "missing_transaction" }
  | { ok: false; status: number; body: string };

/**
 * Server-side GA4 Measurement Protocol `purchase`.
 * No-ops (skipped) when `GA_MEASUREMENT_ID` or `GA_API_SECRET` is missing — callers should still 200 Shopify.
 */
export async function sendPurchaseMeasurementProtocol(
  payload: PurchasePayload,
  env: Env = process.env,
  fetchImpl: typeof fetch = fetch,
): Promise<MeasurementProtocolResult> {
  const measurementId = env.GA_MEASUREMENT_ID?.trim().toUpperCase() ?? "";
  const apiSecret = env.GA_API_SECRET?.trim() ?? "";
  const transactionId = payload.transaction_id.trim();
  if (!measurementId || !apiSecret) {
    return { ok: true, skipped: true, reason: "missing_config" };
  }
  if (!transactionId) {
    return { ok: true, skipped: true, reason: "missing_transaction" };
  }

  const normalized = withNormalizedPayload(payload);
  const clientId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}.${Math.floor(Math.random() * 1e9)}`;

  const url = new URL("https://www.google-analytics.com/mp/collect");
  url.searchParams.set("measurement_id", measurementId);
  url.searchParams.set("api_secret", apiSecret);

  const res = await fetchImpl(url.toString(), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      events: [
        {
          name: "purchase",
          params: {
            transaction_id: transactionId,
            currency: normalized.currency,
            value: normalized.value,
            items: normalized.items,
          },
        },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { ok: false, status: res.status, body };
  }
  return { ok: true };
}
