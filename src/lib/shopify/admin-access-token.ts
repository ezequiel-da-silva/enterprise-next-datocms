import {
  logMissingShopifyAdminEnv,
  readShopifyAdminCredentials,
  readShopifyAdminTokenOverride,
} from "@/lib/shopify/admin-env";
import { normalizeShopDomain } from "@/lib/shopify/parse-product-webhook";

const REFRESH_SKEW_MS = 60_000;
const DEFAULT_EXPIRES_IN_SEC = 86_400;

type CachedToken = { token: string; expiresAt: number };

let cached: CachedToken | null = null;

export type ResolveAdminAccessTokenResult =
  | { ok: true; domain: string; token: string }
  | { ok: false; reason: "not_configured"; missing: string[] }
  | { ok: false; reason: "oauth_error" };

function readStoreDomain(): string | undefined {
  const raw = process.env.SHOPIFY_STORE_DOMAIN?.trim();
  if (!raw) return undefined;
  return normalizeShopDomain(raw);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function cacheIsFresh(entry: CachedToken, now: number): boolean {
  return now < entry.expiresAt - REFRESH_SKEW_MS;
}

async function fetchClientCredentialsToken(
  domain: string,
  clientId: string,
  clientSecret: string,
): Promise<{ token: string; expiresInSec: number } | null> {
  const response = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  const json: unknown = await response.json().catch(() => null);
  const record = asRecord(json);
  const token = typeof record?.access_token === "string" ? record.access_token.trim() : "";
  if (!response.ok || !token) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[resolveAdminAccessToken] client credentials failed", json);
    } else {
      console.error("[resolveAdminAccessToken] client credentials failed");
    }
    return null;
  }
  const expiresIn =
    typeof record?.expires_in === "number" && Number.isFinite(record.expires_in)
      ? record.expires_in
      : DEFAULT_EXPIRES_IN_SEC;
  return { token, expiresInSec: expiresIn };
}

/**
 * Token Admin: override estático, senão client credentials com cache (~24h, renovar 60s antes).
 */
export async function resolveAdminAccessToken(
  now = Date.now(),
): Promise<ResolveAdminAccessTokenResult> {
  const override = readShopifyAdminTokenOverride();
  if (override) {
    const domain = readStoreDomain();
    if (!domain) {
      const missing = ["SHOPIFY_STORE_DOMAIN"];
      logMissingShopifyAdminEnv(missing);
      return { ok: false, reason: "not_configured", missing };
    }
    return { ok: true, domain, token: override };
  }

  const credentials = readShopifyAdminCredentials();
  if (!credentials.ok) {
    logMissingShopifyAdminEnv(credentials.missing);
    return { ok: false, reason: "not_configured", missing: credentials.missing };
  }

  if (cached && cacheIsFresh(cached, now)) {
    return { ok: true, domain: credentials.data.SHOPIFY_STORE_DOMAIN, token: cached.token };
  }

  try {
    const issued = await fetchClientCredentialsToken(
      credentials.data.SHOPIFY_STORE_DOMAIN,
      credentials.data.SHOPIFY_CLIENT_ID,
      credentials.data.SHOPIFY_API_SECRET_KEY,
    );
    if (!issued) return { ok: false, reason: "oauth_error" };
    cached = { token: issued.token, expiresAt: now + issued.expiresInSec * 1000 };
    return { ok: true, domain: credentials.data.SHOPIFY_STORE_DOMAIN, token: issued.token };
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[resolveAdminAccessToken] OAuth request failed", err);
    } else {
      console.error("[resolveAdminAccessToken] OAuth request failed");
    }
    return { ok: false, reason: "oauth_error" };
  }
}

export function resetShopifyAdminTokenCacheForTests(): void {
  cached = null;
}

/** Só testes — força um cache quase a expirar ou ainda fresco. */
export function seedShopifyAdminTokenCacheForTests(token: string, expiresAt: number): void {
  cached = { token, expiresAt };
}
