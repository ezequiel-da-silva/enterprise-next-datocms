import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildAuthorizeUrl,
  buildLogoutUrl,
  discoverCustomerAuth,
  exchangeAuthorizationCode,
  mapCustomerOverview,
  readIdTokenNonce,
  resetCustomerAccountDiscovery,
  sessionFromTokens,
} from "@/infra/shopify/customer-account";

const OPENID = {
  authorization_endpoint: "https://shopify.com/authentication/1/oauth/authorize",
  token_endpoint: "https://shopify.com/authentication/1/oauth/token",
  end_session_endpoint: "https://shopify.com/authentication/1/logout",
};

function jwt(payload: Record<string, unknown>): string {
  return `h.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.s`;
}

describe("customer account", () => {
  beforeEach(() => {
    resetCustomerAccountDiscovery();
    vi.stubEnv("SHOPIFY_STORE_DOMAIN", "demo.myshopify.com");
    vi.stubEnv("SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID", "client-123");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("builds a market-aware PKCE authorize URL", () => {
    const url = new URL(
      buildAuthorizeUrl({
        authorizationEndpoint: OPENID.authorization_endpoint,
        clientId: "client-123",
        redirectUri: "https://example.com/api/account/callback",
        state: "state-1",
        nonce: "nonce-1",
        codeChallenge: "challenge-1",
        locale: "pt",
      }),
    );
    expect(url.searchParams.get("scope")).toBe("openid email customer-account-api:full");
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(url.searchParams.get("code_challenge")).toBe("challenge-1");
    expect(url.searchParams.get("locale")).toBe("pt-BR");
    expect(url.searchParams.get("region_country")).toBe("BR");
  });

  it("builds the logout URL with id_token_hint", () => {
    const url = new URL(buildLogoutUrl(OPENID.end_session_endpoint, "id.tok.en", "https://example.com/pt"));
    expect(url.searchParams.get("id_token_hint")).toBe("id.tok.en");
    expect(url.searchParams.get("post_logout_redirect_uri")).toBe("https://example.com/pt");
  });

  it("rejects discovery documents with non-https endpoints", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ...OPENID, token_endpoint: "http://evil.test" }) }),
    );
    expect(await discoverCustomerAuth()).toBeNull();
  });

  it("exchanges the code with PKCE verifier and the site Origin", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => OPENID })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: "shcat_1", expires_in: 3600, id_token: "a.b.c", refresh_token: "shcrt_1" }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const tokens = await exchangeAuthorizationCode("code-1", "verifier-1");
    expect(tokens?.access_token).toBe("shcat_1");
    const [url, init] = fetchMock.mock.calls[1];
    expect(url).toBe(OPENID.token_endpoint);
    expect(init.headers.Origin).toBe("https://example.com");
    const body = new URLSearchParams(String(init.body));
    expect(body.get("grant_type")).toBe("authorization_code");
    expect(body.get("code_verifier")).toBe("verifier-1");
    expect(body.get("client_id")).toBe("client-123");
    expect(body.get("redirect_uri")).toBe("https://example.com/api/account/callback");
  });

  it("returns null when the token endpoint fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: async () => OPENID })
        .mockResolvedValueOnce({ ok: false, json: async () => ({}) }),
    );
    expect(await exchangeAuthorizationCode("code-1", "verifier-1")).toBeNull();
  });

  it("keeps the previous id and refresh tokens when a refresh omits them", () => {
    const previous = { accessToken: "old", refreshToken: "shcrt_old", idToken: "id-old", expiresAt: 1 };
    expect(sessionFromTokens({ access_token: "new", expires_in: 60 }, previous, 1000)).toEqual({
      accessToken: "new",
      refreshToken: "shcrt_old",
      idToken: "id-old",
      expiresAt: 61_000,
    });
    expect(sessionFromTokens({ access_token: "new", expires_in: 60 }, null)).toBeNull();
  });

  it("reads the nonce claim from the id_token", () => {
    expect(readIdTokenNonce(jwt({ nonce: "n-1" }))).toBe("n-1");
    expect(readIdTokenNonce(jwt({}))).toBeNull();
    expect(readIdTokenNonce("garbage")).toBeNull();
  });

  it("maps the customer and drops malformed orders", () => {
    const overview = mapCustomerOverview({
      firstName: "Ana",
      lastName: null,
      emailAddress: { emailAddress: "ana@example.com" },
      orders: {
        nodes: [
          {
            id: "gid://shopify/Order/1",
            name: "#1001",
            processedAt: "2026-10-01T12:00:00Z",
            financialStatus: "PAID",
            totalPrice: { amount: "139.0", currencyCode: "BRL" },
            statusPageUrl: "https://shopify.com/1/account/orders/1",
          },
          { id: "gid://shopify/Order/2", name: "#1002", processedAt: "x", statusPageUrl: "javascript:alert(1)" },
          { name: "broken" },
        ],
      },
    });
    expect(overview?.email).toBe("ana@example.com");
    expect(overview?.orders).toHaveLength(2);
    expect(overview?.orders[0].totalPrice).toEqual({ amount: "139.0", currencyCode: "BRL" });
    expect(overview?.orders[1].statusPageUrl).toBeNull();
  });
});
