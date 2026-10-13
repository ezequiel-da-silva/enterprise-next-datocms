import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  activeAccessToken,
  codeChallengeFor,
  isCustomerAccountEnabled,
  readCustomerSession,
  readOAuthHandshake,
  sealCustomerSession,
  sealOAuthHandshake,
} from "@/lib/shopify/customer-session";

const SESSION = { accessToken: "shcat_abc", refreshToken: "shcrt_def", idToken: "a.b.c", expiresAt: 2_000_000 };

describe("customer session", () => {
  beforeEach(() => {
    vi.stubEnv("SHOPIFY_CART_ENABLED", "1");
    vi.stubEnv("SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID", "client-123");
    vi.stubEnv("SHOPIFY_CUSTOMER_SESSION_SECRET", "s".repeat(40));
  });
  afterEach(() => vi.unstubAllEnvs());

  it("matches the RFC 7636 S256 test vector", () => {
    expect(codeChallengeFor("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk")).toBe(
      "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
    );
  });

  it("is enabled only with cart flag, client id and a long secret", () => {
    expect(isCustomerAccountEnabled()).toBe(true);
    vi.stubEnv("SHOPIFY_CUSTOMER_SESSION_SECRET", "short");
    expect(isCustomerAccountEnabled()).toBe(false);
    vi.stubEnv("SHOPIFY_CUSTOMER_SESSION_SECRET", "s".repeat(40));
    vi.stubEnv("SHOPIFY_CART_ENABLED", "");
    expect(isCustomerAccountEnabled()).toBe(false);
  });

  it("round-trips the session and rejects a malformed payload", () => {
    const sealed = sealCustomerSession(SESSION);
    expect(readCustomerSession(sealed ?? undefined)).toEqual(SESSION);
    expect(readCustomerSession("garbage")).toBeNull();
  });

  it("round-trips the OAuth handshake", () => {
    const handshake = { state: "x".repeat(20), nonce: "y".repeat(20), verifier: "v".repeat(43), locale: "pt" };
    expect(readOAuthHandshake(sealOAuthHandshake(handshake) ?? undefined)).toEqual(handshake);
  });

  it("treats tokens within a minute of expiry as inactive", () => {
    expect(activeAccessToken(SESSION, 1_000_000)).toBe("shcat_abc");
    expect(activeAccessToken(SESSION, 1_950_000)).toBeNull();
    expect(activeAccessToken(null)).toBeNull();
  });
});
