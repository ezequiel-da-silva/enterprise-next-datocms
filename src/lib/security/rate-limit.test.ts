import { describe, expect, it, beforeEach } from "vitest";
import { checkMemoryRateLimit, resetRateLimitBuckets } from "@/lib/security/rate-limit";

describe("checkMemoryRateLimit", () => {
  beforeEach(() => {
    resetRateLimitBuckets();
  });

  it("allows requests under the limit", () => {
    expect(checkMemoryRateLimit("a", { limit: 2, windowMs: 60_000 }).ok).toBe(true);
    expect(checkMemoryRateLimit("a", { limit: 2, windowMs: 60_000 }).ok).toBe(true);
  });

  it("blocks when limit is exceeded", () => {
    checkMemoryRateLimit("b", { limit: 1, windowMs: 60_000 });
    const blocked = checkMemoryRateLimit("b", { limit: 1, windowMs: 60_000 });
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.retryAfterSec).toBeGreaterThan(0);
    }
  });

  it("isolates keys", () => {
    checkMemoryRateLimit("c1", { limit: 1, windowMs: 60_000 });
    expect(checkMemoryRateLimit("c2", { limit: 1, windowMs: 60_000 }).ok).toBe(true);
  });
});
