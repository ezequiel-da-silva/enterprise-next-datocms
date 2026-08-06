import { describe, expect, it, beforeEach } from "vitest";
import { checkRateLimit, resetRateLimitBuckets } from "@/lib/security/rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    resetRateLimitBuckets();
  });

  it("allows requests under the limit", () => {
    expect(checkRateLimit("a", { limit: 2, windowMs: 60_000 }).ok).toBe(true);
    expect(checkRateLimit("a", { limit: 2, windowMs: 60_000 }).ok).toBe(true);
  });

  it("blocks when limit is exceeded", () => {
    checkRateLimit("b", { limit: 1, windowMs: 60_000 });
    const blocked = checkRateLimit("b", { limit: 1, windowMs: 60_000 });
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.retryAfterSec).toBeGreaterThan(0);
    }
  });

  it("isolates keys", () => {
    checkRateLimit("c1", { limit: 1, windowMs: 60_000 });
    expect(checkRateLimit("c2", { limit: 1, windowMs: 60_000 }).ok).toBe(true);
  });
});
