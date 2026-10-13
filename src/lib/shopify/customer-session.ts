import {
  customerSessionSchema,
  oauthHandshakeSchema,
  type CustomerSession,
  type OAuthHandshake,
} from "@/core/entities/customer-session";
import { seal, unseal } from "@/lib/security/sealed-cookie";
import { isCartEnabled } from "@/lib/shopify/cart-cookie";
import { createHash, randomBytes } from "node:crypto";

export const CUSTOMER_COOKIE = "nd-customer";
export const OAUTH_COOKIE = "nd-oauth";

const CUSTOMER_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 30;
const OAUTH_COOKIE_MAX_AGE_SEC = 60 * 10;
const MIN_SECRET_LENGTH = 32;
/** Refresh a little before the real expiry so in-flight requests don't use a dead token. */
const EXPIRY_SKEW_MS = 60_000;

function readEnv(name: "SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID" | "SHOPIFY_CUSTOMER_SESSION_SECRET"): string | undefined {
  const raw = process.env[name]?.trim();
  return raw ? raw : undefined;
}

export function customerAccountClientId(): string | undefined {
  return readEnv("SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID");
}

function sessionSecret(): string | undefined {
  const secret = readEnv("SHOPIFY_CUSTOMER_SESSION_SECRET");
  return secret && secret.length >= MIN_SECRET_LENGTH ? secret : undefined;
}

/** Server-only: account UI and routes need the cart flag, a client id and a ≥32-char session secret. */
export function isCustomerAccountEnabled(): boolean {
  return isCartEnabled() && Boolean(customerAccountClientId()) && Boolean(sessionSecret());
}

function cookieOptions(maxAge: number, isProduction: boolean) {
  return { httpOnly: true, secure: isProduction, sameSite: "lax" as const, path: "/", maxAge };
}

export function customerCookieOptions(isProduction = process.env.NODE_ENV === "production") {
  return cookieOptions(CUSTOMER_COOKIE_MAX_AGE_SEC, isProduction);
}

export function oauthCookieOptions(isProduction = process.env.NODE_ENV === "production") {
  return cookieOptions(OAUTH_COOKIE_MAX_AGE_SEC, isProduction);
}

export function sealCustomerSession(session: CustomerSession): string | null {
  const secret = sessionSecret();
  return secret ? seal(session, secret) : null;
}

export function readCustomerSession(value: string | undefined): CustomerSession | null {
  const secret = sessionSecret();
  if (!secret) return null;
  const parsed = customerSessionSchema.safeParse(unseal(value, secret));
  return parsed.success ? parsed.data : null;
}

export function sealOAuthHandshake(handshake: OAuthHandshake): string | null {
  const secret = sessionSecret();
  return secret ? seal(handshake, secret) : null;
}

export function readOAuthHandshake(value: string | undefined): OAuthHandshake | null {
  const secret = sessionSecret();
  if (!secret) return null;
  const parsed = oauthHandshakeSchema.safeParse(unseal(value, secret));
  return parsed.success ? parsed.data : null;
}

export function isSessionExpiring(session: CustomerSession, now = Date.now()): boolean {
  return session.expiresAt - EXPIRY_SKEW_MS <= now;
}

/** Access token usable right now, or `null` when missing/expired. */
export function activeAccessToken(session: CustomerSession | null, now = Date.now()): string | null {
  return session && !isSessionExpiring(session, now) ? session.accessToken : null;
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/** PKCE (RFC 7636) S256 challenge for a verifier. */
export function codeChallengeFor(verifier: string): string {
  return createHash("sha256").update(verifier, "ascii").digest("base64url");
}

export function accountPath(locale: string): string {
  return `/${locale}/account`;
}
