import { logWarn } from "@/infra/observability/log-error";
import type { BackInStockInput } from "@/core/entities/back-in-stock";

const WEBHOOK_TIMEOUT_MS = 2_500;

/**
 * Registers a back-in-stock interest for future CRM / Shopify Flow / Klaviyo.
 * Always logs a redacted line; optionally POSTs the full payload to `BACK_IN_STOCK_WEBHOOK_URL`.
 */
export async function registerBackInStockInterest(input: BackInStockInput): Promise<void> {
  logWarn("action.back_in_stock", "Back-in-stock interest registered", {
    context: {
      variantId: input.variantId,
      productHandle: input.productHandle,
      locale: input.locale,
    },
  });

  const webhook = process.env.BACK_IN_STOCK_WEBHOOK_URL?.trim();
  if (!webhook) return;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "back_in_stock",
          email: input.email,
          variantId: input.variantId,
          productHandle: input.productHandle,
          locale: input.locale,
          at: new Date().toISOString(),
        }),
        signal: controller.signal,
        cache: "no-store",
      });
    } finally {
      clearTimeout(timer);
    }
  } catch {
    logWarn("action.back_in_stock", "Back-in-stock webhook failed (best-effort)", {
      context: { productHandle: input.productHandle },
    });
  }
}
