import { linkCookieCart, redirectTo } from "@/app/api/account/account-route-utils";
import { DEFAULT_APP_LOCALE, isAppLocale } from "@/constants/i18n";
import { logWarn } from "@/infra/observability/log-error";
import { exchangeAuthorizationCode, readIdTokenNonce, sessionFromTokens } from "@/infra/shopify/customer-account";
import { isSecretEqual } from "@/lib/security/compare-secret";
import {
  accountPath,
  CUSTOMER_COOKIE,
  customerCookieOptions,
  isCustomerAccountEnabled,
  OAUTH_COOKIE,
  readOAuthHandshake,
  sealCustomerSession,
} from "@/lib/shopify/customer-session";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

/** Shopify redirects here after login: validate state + nonce, exchange the code, store the sealed session. */
export async function GET(request: NextRequest) {
  if (!isCustomerAccountEnabled()) return new NextResponse(null, { status: 404 });
  const params = request.nextUrl.searchParams;
  const handshake = readOAuthHandshake(request.cookies.get(OAUTH_COOKIE)?.value);

  if (!handshake || !isSecretEqual(params.get("state"), handshake.state)) {
    logWarn("account.callback", "Login rejected", { context: { stage: handshake ? "state" : "handshake" } });
    const invalid = new NextResponse("Invalid login state.", { status: 400 });
    invalid.cookies.delete(OAUTH_COOKIE);
    return invalid;
  }

  const locale = isAppLocale(handshake.locale) ? handshake.locale : DEFAULT_APP_LOCALE;
  const failed = (stage: "authorize" | "exchange" | "nonce" | "session") => {
    logWarn("account.callback", "Login failed", { context: { stage } });
    const response = redirectTo(request, `${accountPath(locale)}?error=login`);
    response.cookies.delete(OAUTH_COOKIE);
    return response;
  };

  const code = params.get("code");
  if (params.get("error") || !code) return failed("authorize");

  const tokens = await exchangeAuthorizationCode(code, handshake.verifier);
  if (!tokens?.id_token) return failed("exchange");
  if (!isSecretEqual(readIdTokenNonce(tokens.id_token), handshake.nonce)) return failed("nonce");

  const session = sessionFromTokens(tokens, null);
  const sealed = session ? sealCustomerSession(session) : null;
  if (!session || !sealed) return failed("session");

  await linkCookieCart(request, session.accessToken, locale);
  const response = redirectTo(request, accountPath(locale));
  response.cookies.set(CUSTOMER_COOKIE, sealed, customerCookieOptions());
  response.cookies.delete(OAUTH_COOKIE);
  return response;
}
