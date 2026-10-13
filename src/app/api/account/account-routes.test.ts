import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const exchangeAuthorizationCode = vi.fn();
const linkCartToCustomer = vi.fn();

vi.mock("@/infra/shopify/customer-account", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/infra/shopify/customer-account")>()),
  exchangeAuthorizationCode: (...args: unknown[]) => exchangeAuthorizationCode(...args),
}));
vi.mock("@/infra/shopify/cart", () => ({
  linkCartToCustomer: (...args: unknown[]) => linkCartToCustomer(...args),
}));

const { GET: callback } = await import("@/app/api/account/callback/route");
const { safeNextPath } = await import("@/app/api/account/account-route-utils");
const { CUSTOMER_COOKIE, OAUTH_COOKIE, readCustomerSession, sealOAuthHandshake } = await import(
  "@/lib/shopify/customer-session"
);

const HANDSHAKE = { state: "s".repeat(24), nonce: "n".repeat(24), verifier: "v".repeat(64), locale: "pt" };
const CART_ID = "gid://shopify/Cart/c1-abc?key=k";

function idToken(nonce: string): string {
  return `h.${Buffer.from(JSON.stringify({ nonce })).toString("base64url")}.s`;
}

function callbackRequest(query: string, cookies: Record<string, string>): NextRequest {
  const cookie = Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
  return new NextRequest(`https://example.com/api/account/callback?${query}`, { headers: { cookie } });
}

describe("account routes", () => {
  beforeEach(() => {
    vi.stubEnv("SHOPIFY_CART_ENABLED", "1");
    vi.stubEnv("SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID", "client-123");
    vi.stubEnv("SHOPIFY_CUSTOMER_SESSION_SECRET", "x".repeat(40));
    exchangeAuthorizationCode.mockReset();
    linkCartToCustomer.mockReset();
  });
  afterEach(() => vi.unstubAllEnvs());

  it("rejects a callback whose state does not match the handshake", async () => {
    const res = await callback(
      callbackRequest(`code=c&state=${"x".repeat(24)}`, { [OAUTH_COOKIE]: sealOAuthHandshake(HANDSHAKE) ?? "" }),
    );
    expect(res.status).toBe(400);
    expect(exchangeAuthorizationCode).not.toHaveBeenCalled();
  });

  it("rejects a callback without the handshake cookie", async () => {
    const res = await callback(callbackRequest(`code=c&state=${HANDSHAKE.state}`, {}));
    expect(res.status).toBe(400);
  });

  it("refuses tokens whose nonce differs", async () => {
    exchangeAuthorizationCode.mockResolvedValue({ access_token: "shcat_1", expires_in: 3600, id_token: idToken("other") });
    const res = await callback(
      callbackRequest(`code=c&state=${HANDSHAKE.state}`, { [OAUTH_COOKIE]: sealOAuthHandshake(HANDSHAKE) ?? "" }),
    );
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe("https://example.com/pt/account?error=login");
    expect(res.cookies.get(CUSTOMER_COOKIE)).toBeUndefined();
  });

  it("stores the sealed session and links the cart on success", async () => {
    exchangeAuthorizationCode.mockResolvedValue({
      access_token: "shcat_1",
      expires_in: 3600,
      id_token: idToken(HANDSHAKE.nonce),
      refresh_token: "shcrt_1",
    });
    const res = await callback(
      callbackRequest(`code=c&state=${HANDSHAKE.state}`, {
        [OAUTH_COOKIE]: sealOAuthHandshake(HANDSHAKE) ?? "",
        "nd-cart": CART_ID,
      }),
    );
    expect(res.headers.get("location")).toBe("https://example.com/pt/account");
    expect(exchangeAuthorizationCode).toHaveBeenCalledWith("c", HANDSHAKE.verifier);
    expect(linkCartToCustomer).toHaveBeenCalledWith(CART_ID, "shcat_1", "pt");
    const session = readCustomerSession(res.cookies.get(CUSTOMER_COOKIE)?.value);
    expect(session).toMatchObject({ accessToken: "shcat_1", refreshToken: "shcrt_1" });
  });

  it("only accepts locale-prefixed internal paths as redirect targets", () => {
    expect(safeNextPath("/pt/account")).toBe("/pt/account");
    expect(safeNextPath("/en")).toBe("/en");
    expect(safeNextPath("//evil.com/pt")).toBeNull();
    expect(safeNextPath("https://evil.com")).toBeNull();
    expect(safeNextPath("/pt/../../x")).toBeNull();
    expect(safeNextPath("/xx/account")).toBeNull();
    expect(safeNextPath(null)).toBeNull();
  });
});
