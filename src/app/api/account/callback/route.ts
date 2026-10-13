import { linkCookieCart, redirectTo } from "@/app/api/account/account-route-utils";
import { DEFAULT_APP_LOCALE, isAppLocale } from "@/constants/i18n";
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
    const invalid = new NextResponse("Invalid login state.", { status: 400 });
    invalid.cookies.delete(OAUTH_COOKIE);
    return invalid;
  }

  const locale = isAppLocale(handshake.locale) ? handshake.locale : DEFAULT_APP_LOCALE;
  const failed = () => {
    const response = redirectTo(request, `${accountPath(locale)}?error=login`);
    response.cookies.delete(OAUTH_COOKIE);
    return response;
  };

  const code = params.get("code");
  if (params.get("error") || !code) return failed();

  const tokens = await exchangeAuthorizationCode(code, handshake.verifier);
  if (!tokens?.id_token || !isSecretEqual(readIdTokenNonce(tokens.id_token), handshake.nonce)) return failed();

  const session = sessionFromTokens(tokens, null);
  const sealed = session ? sealCustomerSession(session) : null;
  if (!session || !sealed) return failed();

  await linkCookieCart(request, session.accessToken, locale);
  const response = redirectTo(request, accountPath(locale));
  response.cookies.set(CUSTOMER_COOKIE, sealed, customerCookieOptions());
  response.cookies.delete(OAUTH_COOKIE);
  return response;
}
