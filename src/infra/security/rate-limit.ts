import { createHash } from "node:crypto";
import { Redis } from "@upstash/redis";
import { logError } from "@/infra/observability/log-error";
import {
  checkMemoryRateLimit,
  DEFAULT_RATE_LIMIT,
  type RateLimitOptions,
  type RateLimitResult,
} from "@/lib/security/rate-limit";

export type { RateLimitOptions, RateLimitResult };

type RedisEnv = { url: string; token: string };

let client: Redis | null = null;
let clientEnvKey: string | null = null;
let warnedFallback = false;

/** `UPSTASH_REDIS_*` or the `KV_REST_API_*` names the Vercel Marketplace integration creates. Server-only. */
export function readRateLimitRedisEnv(): RedisEnv | null {
  const url = (process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL)?.trim();
  const token = (process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN)?.trim();
  if (!url || !token) return null;
  try {
    if (new URL(url).protocol !== "https:") return null;
  } catch {
    return null;
  }
  return { url, token };
}

function redisClient(env: RedisEnv): Redis {
  const key = `${env.url}|${env.token}`;
  if (!client || clientEnvKey !== key) {
    client = new Redis({ url: env.url, token: env.token });
    clientEnvKey = key;
  }
  return client;
}

/** The raw key carries the client IP; only its hash is sent to Upstash. */
export function rateLimitRedisKey(key: string): string {
  return `rl:${createHash("sha256").update(key).digest("hex")}`;
}

/**
 * Fixed-window limiter shared by every serverless instance (Upstash Redis).
 * Without Redis env, or when Redis fails, falls back to the per-instance memory limiter.
 */
export async function checkRateLimit(
  key: string,
  options: RateLimitOptions = DEFAULT_RATE_LIMIT,
): Promise<RateLimitResult> {
  const env = readRateLimitRedisEnv();
  if (!env) return checkMemoryRateLimit(key, options);

  const redisKey = rateLimitRedisKey(key);
  try {
    const [, count, ttlMs] = await redisClient(env)
      .multi()
      .set(redisKey, 0, { nx: true, px: options.windowMs })
      .incr(redisKey)
      .pttl(redisKey)
      .exec<[unknown, number, number]>();
    if (count <= options.limit) return { ok: true };
    const remainingMs = ttlMs > 0 ? ttlMs : options.windowMs;
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil(remainingMs / 1000)) };
  } catch (err) {
    if (!warnedFallback) {
      warnedFallback = true;
      logError("security.rate-limit", "Upstash Redis failed; using the in-memory limiter", { error: err });
    }
    return checkMemoryRateLimit(key, options);
  }
}

/** Test helper — drops the cached client and the one-time warning flag. */
export function resetRateLimitRedisForTests(): void {
  client = null;
  clientEnvKey = null;
  warnedFallback = false;
}
