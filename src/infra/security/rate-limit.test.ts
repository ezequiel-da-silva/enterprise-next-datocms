import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const store = new Map<string, number>();
const calls: { op: string; key: string }[] = [];
let failNext = false;

vi.mock("@upstash/redis", () => {
  class Redis {
    multi() {
      const ops: (() => unknown)[] = [];
      const chain = {
        set(key: string, value: number, opts: { nx?: boolean }) {
          calls.push({ op: "set", key });
          ops.push(() => {
            if (opts.nx && store.has(key)) return null;
            store.set(key, value);
            return "OK";
          });
          return chain;
        },
        incr(key: string) {
          calls.push({ op: "incr", key });
          ops.push(() => {
            const next = (store.get(key) ?? 0) + 1;
            store.set(key, next);
            return next;
          });
          return chain;
        },
        pttl(key: string) {
          calls.push({ op: "pttl", key });
          ops.push(() => 42_000);
          return chain;
        },
        async exec() {
          if (failNext) {
            failNext = false;
            throw new Error("redis down");
          }
          return ops.map((op) => op());
        },
      };
      return chain;
    }
  }
  return { Redis };
});

const { checkRateLimit, rateLimitRedisKey, readRateLimitRedisEnv, resetRateLimitRedisForTests } = await import(
  "@/infra/security/rate-limit"
);
const { resetRateLimitBuckets } = await import("@/lib/security/rate-limit");

const ENV_KEYS = ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN", "KV_REST_API_URL", "KV_REST_API_TOKEN"] as const;
const snapshot: Partial<Record<(typeof ENV_KEYS)[number], string | undefined>> = {};
const OPTIONS = { limit: 2, windowMs: 60_000 };

describe("checkRateLimit (Upstash)", () => {
  beforeEach(() => {
    for (const key of ENV_KEYS) {
      snapshot[key] = process.env[key];
      delete process.env[key];
    }
    store.clear();
    calls.length = 0;
    failNext = false;
    resetRateLimitBuckets();
    resetRateLimitRedisForTests();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    for (const key of ENV_KEYS) {
      const previous = snapshot[key];
      if (previous === undefined) delete process.env[key];
      else process.env[key] = previous;
    }
  });

  function useRedis() {
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "token";
  }

  it("allows up to the limit, then blocks with retryAfterSec from the key TTL", async () => {
    useRedis();
    expect(await checkRateLimit("login:203.0.113.9", OPTIONS)).toEqual({ ok: true });
    expect(await checkRateLimit("login:203.0.113.9", OPTIONS)).toEqual({ ok: true });
    expect(await checkRateLimit("login:203.0.113.9", OPTIONS)).toEqual({ ok: false, retryAfterSec: 42 });
    expect(store.size).toBe(1);
  });

  it("never sends the raw key (IP) to Redis", async () => {
    useRedis();
    await checkRateLimit("login:203.0.113.9", OPTIONS);
    expect(calls.length).toBeGreaterThan(0);
    for (const call of calls) {
      expect(call.key).toBe(rateLimitRedisKey("login:203.0.113.9"));
      expect(call.key).not.toContain("203.0.113.9");
    }
  });

  it("uses the memory limiter when Redis env is missing", async () => {
    expect(await checkRateLimit("k", { limit: 1, windowMs: 60_000 })).toEqual({ ok: true });
    expect((await checkRateLimit("k", { limit: 1, windowMs: 60_000 })).ok).toBe(false);
    expect(calls).toHaveLength(0);
  });

  it("falls back to memory when Redis throws", async () => {
    useRedis();
    vi.spyOn(console, "error").mockImplementation(() => {});
    failNext = true;
    expect(await checkRateLimit("k", OPTIONS)).toEqual({ ok: true });
    expect(console.error).toHaveBeenCalledOnce();
  });

  it("accepts the Vercel KV names and rejects non-https URLs", () => {
    process.env.KV_REST_API_URL = "https://kv.upstash.io";
    process.env.KV_REST_API_TOKEN = "kv-token";
    expect(readRateLimitRedisEnv()).toEqual({ url: "https://kv.upstash.io", token: "kv-token" });
    process.env.KV_REST_API_URL = "http://kv.upstash.io";
    expect(readRateLimitRedisEnv()).toBeNull();
  });
});
