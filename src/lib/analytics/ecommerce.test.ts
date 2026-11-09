import { afterEach, describe, expect, it, vi } from "vitest";
import {
  sendPurchaseMeasurementProtocol,
  trackAddToCart,
  trackPurchase,
  trackViewItem,
} from "@/lib/analytics/ecommerce";

describe("ecommerce tracking", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    Reflect.deleteProperty(globalThis as object, "window");
  });

  it("no-ops without window / gtag", () => {
    expect(() =>
      trackViewItem({ currency: "USD", value: 10, items: [{ item_id: "a", item_name: "A" }] }),
    ).not.toThrow();
  });

  it("fires view_item, add_to_cart, and purchase through gtag with currency fallback", () => {
    const gtag = vi.fn();
    vi.stubGlobal("window", { gtag });

    trackViewItem({
      currency: "  ",
      value: 12.5,
      items: [{ item_id: "board", item_name: "Board", price: 12.5, quantity: 1, item_variant: "Ice" }],
    });
    trackAddToCart({
      currency: "brl",
      value: 25,
      items: [{ item_id: "board", item_name: "Board", price: 12.5, quantity: 2 }],
    });
    trackPurchase({
      transaction_id: " #1001 ",
      currency: "usd",
      value: 12.5,
      items: [{ item_id: "board", item_name: "Board", price: 12.5, quantity: 1 }],
    });

    expect(gtag).toHaveBeenCalledWith("event", "view_item", {
      currency: "USD",
      value: 12.5,
      items: [{ item_id: "board", item_name: "Board", price: 12.5, quantity: 1, item_variant: "Ice" }],
    });
    expect(gtag).toHaveBeenCalledWith("event", "add_to_cart", {
      currency: "BRL",
      value: 25,
      items: [{ item_id: "board", item_name: "Board", price: 12.5, quantity: 2 }],
    });
    expect(gtag).toHaveBeenCalledWith("event", "purchase", {
      currency: "USD",
      value: 12.5,
      items: [{ item_id: "board", item_name: "Board", price: 12.5, quantity: 1 }],
      transaction_id: "#1001",
    });
  });
});

describe("sendPurchaseMeasurementProtocol", () => {
  it("skips when GA env is missing", async () => {
    const fetchImpl = vi.fn();
    await expect(
      sendPurchaseMeasurementProtocol(
        { transaction_id: "#1", currency: "USD", value: 1, items: [] },
        {},
        fetchImpl,
      ),
    ).resolves.toEqual({ ok: true, skipped: true, reason: "missing_config" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("posts purchase to the Measurement Protocol endpoint", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, text: async () => "" });
    const result = await sendPurchaseMeasurementProtocol(
      {
        transaction_id: "#1001",
        currency: "brl",
        value: 99,
        items: [{ item_id: "board", item_name: "Board", price: 99, quantity: 1 }],
      },
      { GA_MEASUREMENT_ID: "G-TEST123", GA_API_SECRET: "secret" },
      fetchImpl,
    );
    expect(result).toEqual({ ok: true });
    expect(fetchImpl).toHaveBeenCalledOnce();
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("measurement_id=G-TEST123");
    expect(url).toContain("api_secret=secret");
    const body = JSON.parse(String(init.body)) as {
      events: Array<{ name: string; params: { transaction_id: string; currency: string; value: number } }>;
    };
    expect(body.events[0]?.name).toBe("purchase");
    expect(body.events[0]?.params).toMatchObject({
      transaction_id: "#1001",
      currency: "BRL",
      value: 99,
    });
  });
});
