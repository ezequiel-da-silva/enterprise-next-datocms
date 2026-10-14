import { afterEach, describe, expect, it, vi } from "vitest";
import { logError, logWarn, logWarnThrottled } from "@/infra/observability/log-error";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe("logError", () => {
  it("writes one JSON line with scope, message and a timestamp", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubEnv("VERCEL_ENV", "production");
    logError("webhook.shopify.product", "Sync failed", { context: { handle: "hat", token: "x" } });

    expect(spy).toHaveBeenCalledOnce();
    const entry = JSON.parse(String(spy.mock.calls[0]?.[0])) as Record<string, unknown>;
    expect(entry).toMatchObject({
      level: "error",
      scope: "webhook.shopify.product",
      message: "Sync failed",
      env: "production",
      context: { handle: "hat" },
    });
    expect(typeof entry.ts).toBe("string");
  });

  it("hides the raw error message in production", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubEnv("NODE_ENV", "production");
    logError("cms.upsert", "failed", { error: new Error("payload with shpat_secret") });
    expect(String(spy.mock.calls[0]?.[0])).not.toContain("shpat_secret");
  });
});

describe("logWarn", () => {
  it("uses console.warn with level warn", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    logWarn("account.callback", "login failed", { context: { stage: "exchange" } });
    expect(JSON.parse(String(spy.mock.calls[0]?.[0]))).toMatchObject({ level: "warn", context: { stage: "exchange" } });
  });
});

describe("logWarnThrottled", () => {
  it("logs once per key inside the window and again after it", () => {
    vi.useFakeTimers();
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    logWarnThrottled("k1", "scope", "fallback");
    logWarnThrottled("k1", "scope", "fallback");
    logWarnThrottled("k2", "scope", "fallback");
    expect(spy).toHaveBeenCalledTimes(2);

    vi.advanceTimersByTime(5 * 60 * 1000 + 1);
    logWarnThrottled("k1", "scope", "fallback");
    expect(spy).toHaveBeenCalledTimes(3);
  });
});
