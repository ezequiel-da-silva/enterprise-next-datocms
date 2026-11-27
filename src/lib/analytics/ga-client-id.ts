/**
 * GA4 client_id helpers — bridge browser session → Shopify cart attribute → Measurement Protocol.
 * Cookie is first-party (not httpOnly) so the consent client can write it and Server Actions can read it.
 */

export const GA_CLIENT_ID_COOKIE = "nd-ga-cid";
export const GA_CLIENT_ID_CART_ATTR = "ga_client_id";
export const GA_CLIENT_ID_MAX_AGE_SEC = 60 * 60 * 24 * 400;

/** GA4 Measurement Protocol client_id shape (two numeric segments). */
const GA_CLIENT_ID_RE = /^\d+\.\d+$/;

export function isValidGaClientId(raw: string | null | undefined): raw is string {
  const value = raw?.trim() ?? "";
  return GA_CLIENT_ID_RE.test(value);
}

/**
 * `_ga` looks like `GA1.1.123456789.1700000000` (or `GA1.2.…` with more dots).
 * The client_id is the last two numeric segments.
 */
export function parseGaClientIdFromGaCookie(raw: string | null | undefined): string | null {
  const value = raw?.trim() ?? "";
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length < 4) return null;
  const clientId = `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
  return isValidGaClientId(clientId) ? clientId : null;
}

/** Reads `_ga` from a `document.cookie`-style header. */
export function readGaCookieFromHeader(header: string | null | undefined): string | null {
  for (const part of (header ?? "").split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === "_ga") {
      const decoded = decodeURIComponent(rest.join("=").trim());
      return decoded || null;
    }
  }
  return null;
}

export function readGaClientIdCookieFromHeader(header: string | null | undefined): string | null {
  for (const part of (header ?? "").split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === GA_CLIENT_ID_COOKIE) {
      const value = decodeURIComponent(rest.join("=").trim());
      return isValidGaClientId(value) ? value : null;
    }
  }
  return null;
}

export function serializeGaClientIdCookie(clientId: string, secure: boolean): string {
  return [
    `${GA_CLIENT_ID_COOKIE}=${encodeURIComponent(clientId)}`,
    "Path=/",
    `Max-Age=${GA_CLIENT_ID_MAX_AGE_SEC}`,
    "SameSite=Lax",
    ...(secure ? ["Secure"] : []),
  ].join("; ");
}

export function serializeGaClientIdCookieRemoval(secure: boolean): string {
  return [
    `${GA_CLIENT_ID_COOKIE}=`,
    "Path=/",
    "Max-Age=0",
    "SameSite=Lax",
    ...(secure ? ["Secure"] : []),
  ].join("; ");
}

/** Prefer a validated id; otherwise a random UUID for Measurement Protocol. */
export function resolveMeasurementProtocolClientId(preferred: string | null | undefined): string {
  if (isValidGaClientId(preferred)) return preferred.trim();
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}.${Math.floor(Math.random() * 1e9)}`;
}
