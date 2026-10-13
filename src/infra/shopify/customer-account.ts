import type { AppLocale } from "@/constants/i18n";
import { tokenResponseSchema, type CustomerSession, type TokenResponse } from "@/core/entities/customer-session";
import { asRecord, readMoney, storefrontShopDomain, type StorefrontMoney } from "@/infra/shopify/storefront";
import { getSiteBaseUrl } from "@/lib/seo/site-config";
import { customerAccountClientId } from "@/lib/shopify/customer-session";
import { shopifyCountryFromLocale } from "@/lib/shopify/locale-map";

/**
 * Shopify Customer Account API (headless, Public client + PKCE). Endpoints are discovered from
 * the shop domain; token requests must carry an `Origin` listed under "JavaScript origins".
 */

export type CustomerAuthEndpoints = {
  authorizationEndpoint: string;
  tokenEndpoint: string;
  endSessionEndpoint: string;
};

export type CustomerOrder = {
  id: string;
  name: string;
  processedAt: string;
  financialStatus: string | null;
  totalPrice: StorefrontMoney | null;
  statusPageUrl: string | null;
};

export type CustomerOverview = {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  orders: CustomerOrder[];
};

const DISCOVERY_TTL_MS = 60 * 60 * 1000;
const USER_AGENT = "next-dato-storefront";

const CUSTOMER_OVERVIEW_QUERY = /* GraphQL */ `
  query CustomerOverview {
    customer {
      firstName
      lastName
      emailAddress { emailAddress }
      orders(first: 10, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
          id
          name
          processedAt
          financialStatus
          totalPrice { amount currencyCode }
          statusPageUrl
        }
      }
    }
  }
`;

let authCache: { at: number; value: CustomerAuthEndpoints } | null = null;
let graphqlCache: { at: number; value: string } | null = null;

function httpsUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

async function fetchJson(url: string): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT }, cache: "no-store" });
    if (!res.ok) return null;
    return asRecord(await res.json());
  } catch {
    return null;
  }
}

export function resetCustomerAccountDiscovery(): void {
  authCache = null;
  graphqlCache = null;
}

export async function discoverCustomerAuth(now = Date.now()): Promise<CustomerAuthEndpoints | null> {
  if (authCache && now - authCache.at < DISCOVERY_TTL_MS) return authCache.value;
  const shop = storefrontShopDomain();
  if (!shop) return null;
  const json = await fetchJson(`https://${shop}/.well-known/openid-configuration`);
  const authorizationEndpoint = httpsUrl(json?.authorization_endpoint);
  const tokenEndpoint = httpsUrl(json?.token_endpoint);
  const endSessionEndpoint = httpsUrl(json?.end_session_endpoint);
  if (!authorizationEndpoint || !tokenEndpoint || !endSessionEndpoint) return null;
  const value = { authorizationEndpoint, tokenEndpoint, endSessionEndpoint };
  authCache = { at: now, value };
  return value;
}

async function discoverGraphqlEndpoint(now = Date.now()): Promise<string | null> {
  if (graphqlCache && now - graphqlCache.at < DISCOVERY_TTL_MS) return graphqlCache.value;
  const shop = storefrontShopDomain();
  if (!shop) return null;
  const value = httpsUrl((await fetchJson(`https://${shop}/.well-known/customer-account-api`))?.graphql_api);
  if (!value) return null;
  graphqlCache = { at: now, value };
  return value;
}

export function customerAccountRedirectUri(): string {
  return `${getSiteBaseUrl()}/api/account/callback`;
}

/** Shopify login screen language (supports regional variants). */
export function customerLoginLocale(locale: AppLocale): string {
  if (locale === "pt") return "pt-BR";
  return locale;
}

export function buildAuthorizeUrl(input: {
  authorizationEndpoint: string;
  clientId: string;
  redirectUri: string;
  state: string;
  nonce: string;
  codeChallenge: string;
  locale: AppLocale;
}): string {
  const url = new URL(input.authorizationEndpoint);
  url.searchParams.set("scope", "openid email customer-account-api:full");
  url.searchParams.set("client_id", input.clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", input.redirectUri);
  url.searchParams.set("state", input.state);
  url.searchParams.set("nonce", input.nonce);
  url.searchParams.set("code_challenge", input.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("locale", customerLoginLocale(input.locale));
  url.searchParams.set("region_country", shopifyCountryFromLocale(input.locale));
  return url.toString();
}

export function buildLogoutUrl(endSessionEndpoint: string, idToken: string, postLogoutRedirectUri: string): string {
  const url = new URL(endSessionEndpoint);
  url.searchParams.set("id_token_hint", idToken);
  url.searchParams.set("post_logout_redirect_uri", postLogoutRedirectUri);
  return url.toString();
}

async function requestTokens(params: Record<string, string>): Promise<TokenResponse | null> {
  const clientId = customerAccountClientId();
  const auth = await discoverCustomerAuth();
  if (!clientId || !auth) return null;
  try {
    const res = await fetch(auth.tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Origin: getSiteBaseUrl(),
        "User-Agent": USER_AGENT,
      },
      body: new URLSearchParams({ client_id: clientId, ...params }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const parsed = tokenResponseSchema.safeParse(await res.json());
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function exchangeAuthorizationCode(code: string, codeVerifier: string): Promise<TokenResponse | null> {
  return requestTokens({
    grant_type: "authorization_code",
    redirect_uri: customerAccountRedirectUri(),
    code,
    code_verifier: codeVerifier,
  });
}

export function refreshCustomerTokens(refreshToken: string): Promise<TokenResponse | null> {
  return requestTokens({ grant_type: "refresh_token", refresh_token: refreshToken });
}

/** Builds the stored session; a refresh response may omit `id_token`, so keep the previous one. */
export function sessionFromTokens(
  tokens: TokenResponse,
  previous: CustomerSession | null,
  now = Date.now(),
): CustomerSession | null {
  const idToken = tokens.id_token ?? previous?.idToken;
  if (!idToken) return null;
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token ?? previous?.refreshToken ?? null,
    idToken,
    expiresAt: now + tokens.expires_in * 1000,
  };
}

/** `nonce` claim from the id_token payload (token came straight from the token endpoint over TLS). */
export function readIdTokenNonce(idToken: string): string | null {
  const payload = idToken.split(".")[1];
  if (!payload) return null;
  try {
    const claims = asRecord(JSON.parse(Buffer.from(payload, "base64url").toString("utf8")));
    return typeof claims?.nonce === "string" ? claims.nonce : null;
  } catch {
    return null;
  }
}

function readOrder(value: unknown): CustomerOrder | null {
  const record = asRecord(value);
  if (!record || typeof record.id !== "string" || typeof record.name !== "string") return null;
  if (typeof record.processedAt !== "string") return null;
  return {
    id: record.id,
    name: record.name,
    processedAt: record.processedAt,
    financialStatus: typeof record.financialStatus === "string" ? record.financialStatus : null,
    totalPrice: readMoney(record.totalPrice),
    statusPageUrl: httpsUrl(record.statusPageUrl),
  };
}

export function mapCustomerOverview(value: unknown): CustomerOverview | null {
  const customer = asRecord(value);
  if (!customer) return null;
  const nodes = asRecord(customer.orders)?.nodes;
  const email = asRecord(customer.emailAddress)?.emailAddress;
  return {
    firstName: typeof customer.firstName === "string" ? customer.firstName : null,
    lastName: typeof customer.lastName === "string" ? customer.lastName : null,
    email: typeof email === "string" ? email : null,
    orders: Array.isArray(nodes) ? nodes.map(readOrder).filter((o): o is CustomerOrder => o !== null) : [],
  };
}

/** Name, e-mail and the latest orders; `null` on missing config, expired token or HTTP error. */
export async function getCustomerOverview(accessToken: string): Promise<CustomerOverview | null> {
  const endpoint = await discoverGraphqlEndpoint();
  if (!endpoint) return null;
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: accessToken,
        Origin: getSiteBaseUrl(),
        "User-Agent": USER_AGENT,
      },
      body: JSON.stringify({ query: CUSTOMER_OVERVIEW_QUERY, variables: {} }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = asRecord(await res.json());
    return mapCustomerOverview(asRecord(json?.data)?.customer);
  } catch {
    return null;
  }
}
