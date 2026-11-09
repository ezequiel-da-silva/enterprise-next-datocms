import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
}));

const sendPurchaseMeasurementProtocol = vi.fn();

vi.mock("@/lib/analytics/ecommerce", async () => {
  const actual = await vi.importActual<typeof import("@/lib/analytics/ecommerce")>("@/lib/analytics/ecommerce");
  return {
    ...actual,
    sendPurchaseMeasurementProtocol: (...args: unknown[]) => sendPurchaseMeasurementProtocol(...args),
  };
});

import { POST } from "./route";

const WEBHOOK_KEYS = [
  "SHOPIFY_CLIENT_ID",
  "SHOPIFY_API_SECRET_KEY",
  "SHOPIFY_STORE_DOMAIN",
  "DATOCMS_USER_REVIEWS_CDA_TOKEN",
] as const;

const SECRET = "shpss_test_secret";
const SHOP = "shop.myshopify.com";

function signedRequest(body: string, topic: string): NextRequest {
  const digest = createHmac("sha256", SECRET).update(body, "utf8").digest("base64");
  return new NextRequest("https://example.com/api/webhooks/shopify", {
    method: "POST",
    body,
    headers: {
      "content-type": "application/json",
      "x-shopify-hmac-sha256": digest,
      "x-shopify-shop-domain": SHOP,
      "x-shopify-topic": topic,
    },
  });
}

describe("POST /api/webhooks/shopify", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    for (const key of WEBHOOK_KEYS) vi.stubEnv(key, "");
    sendPurchaseMeasurementProtocol.mockReset();
  });

  afterEach(() => {
    errorSpy.mockRestore();
    warnSpy.mockRestore();
    vi.unstubAllEnvs();
  });

  it("returns a generic 500 and logs the missing names", async () => {
    const res = await POST(
      new NextRequest("https://example.com/api/webhooks/shopify", { method: "POST", body: "{}" }),
    );
    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({ error: "Webhook not configured" });
    const logged = errorSpy.mock.calls.map((call: readonly unknown[]) => String(call[0])).join("\n");
    expect(logged).toContain("SHOPIFY_API_SECRET_KEY");
    expect(logged).not.toContain('"missing":[');
  });

  it("rejects unknown topics with 401", async () => {
    vi.stubEnv("SHOPIFY_CLIENT_ID", "cid");
    vi.stubEnv("SHOPIFY_API_SECRET_KEY", SECRET);
    vi.stubEnv("SHOPIFY_STORE_DOMAIN", SHOP);
    vi.stubEnv("DATOCMS_USER_REVIEWS_CDA_TOKEN", "dato");
    const res = await POST(signedRequest("{}", "orders/create"));
    expect(res.status).toBe(401);
  });

  it("sends GA4 purchase for orders/paid", async () => {
    vi.stubEnv("SHOPIFY_CLIENT_ID", "cid");
    vi.stubEnv("SHOPIFY_API_SECRET_KEY", SECRET);
    vi.stubEnv("SHOPIFY_STORE_DOMAIN", SHOP);
    vi.stubEnv("DATOCMS_USER_REVIEWS_CDA_TOKEN", "dato");
    sendPurchaseMeasurementProtocol.mockResolvedValue({ ok: true });

    const body = JSON.stringify({
      id: 9,
      name: "#1001",
      currency: "USD",
      total_price: "10.00",
      line_items: [{ title: "Board", sku: "B1", quantity: 1, price: "10.00" }],
    });
    const res = await POST(signedRequest(body, "orders/paid"));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ success: true, purchase: "sent" });
    expect(sendPurchaseMeasurementProtocol).toHaveBeenCalledWith({
      transaction_id: "#1001",
      currency: "USD",
      value: 10,
      items: [{ item_id: "B1", item_name: "Board", price: 10, quantity: 1, item_variant: undefined }],
    });
  });
});
