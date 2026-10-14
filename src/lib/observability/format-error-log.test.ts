import { describe, expect, it } from "vitest";
import { buildErrorLog } from "@/lib/observability/format-error-log";

const base = { level: "error", scope: "webhook.shopify.product", message: "Sync failed" } as const;

describe("buildErrorLog", () => {
  it("keeps only the error name in production", () => {
    const entry = buildErrorLog({ ...base, error: new TypeError("secret payload"), isProduction: true });
    expect(entry.error).toEqual({ name: "TypeError" });
    expect(JSON.stringify(entry)).not.toContain("secret payload");
  });

  it("includes message and stack outside production", () => {
    const entry = buildErrorLog({ ...base, error: new Error("boom"), isProduction: false });
    expect(entry.error?.message).toBe("boom");
    expect(entry.error?.stack).toContain("boom");
  });

  it("describes non-Error throwables by type only", () => {
    expect(buildErrorLog({ ...base, error: "oops", isProduction: false }).error).toEqual({ name: "string" });
  });

  it("keeps detail in production but truncates it", () => {
    const entry = buildErrorLog({ ...base, detail: "x".repeat(600), isProduction: true });
    expect(entry.detail).toHaveLength(501);
    expect(entry.detail?.endsWith("…")).toBe(true);
  });

  it("drops sensitive and undefined context keys and truncates long values", () => {
    const entry = buildErrorLog({
      ...base,
      isProduction: true,
      context: {
        handle: "hat",
        status: 500,
        retried: false,
        accessToken: "shpat_x",
        customerEmail: "a@b.c",
        SESSION_COOKIE: "c",
        authorization: "Bearer x",
        missing: undefined,
        note: "y".repeat(300),
      },
    });
    expect(Object.keys(entry.context ?? {}).sort()).toEqual(["handle", "note", "retried", "status"]);
    expect(entry.context?.note).toHaveLength(201);
  });

  it("omits empty optional fields", () => {
    expect(buildErrorLog({ ...base, context: { token: "x" }, isProduction: true })).toEqual({
      level: "error",
      scope: "webhook.shopify.product",
      message: "Sync failed",
    });
  });
});
