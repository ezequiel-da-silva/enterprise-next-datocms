import { clientIpKey, readLocaleParam, redirectTo } from "@/app/api/account/account-route-utils";
import { buildAuthorizeUrl, customerAccountRedirectUri, discoverCustomerAuth } from "@/infra/shopify/customer-account";
import { checkRateLimit } from "@/infra/security/rate-limit";
import {
  accountPath,
  codeChallengeFor,
  customerAccountClientId,
  isCustomerAccountEnabled,
  OAUTH_COOKIE,
  oauthCookieOptions,
  randomToken,
  sealOAuthHandshake,
} from "@/lib/shopify/customer-session";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const LOGIN_RATE_LIMIT = { limit: 10, windowMs: 60_000 };

/** Starts the Customer Account OAuth flow (PKCE); state/nonce/verifier live in the sealed `nd-oauth` cookie. */
export async function GET(request: NextRequest) {
  if (!isCustomerAccountEnabled()) return new NextResponse(null, { status: 404 });
  const locale = readLocaleParam(request);
  if (!(await checkRateLimit(clientIpKey(request, "account-login"), LOGIN_RATE_LIMIT)).ok) {
    return redirectTo(request, `${accountPath(locale)}?error=rate`);
  }

  const clientId = customerAccountClientId();
  const auth = await discoverCustomerAuth();
  const handshake = { state: randomToken(), nonce: randomToken(), verifier: randomToken(48), locale };
  const sealed = sealOAuthHandshake(handshake);
  if (!clientId || !auth || !sealed) return redirectTo(request, `${accountPath(locale)}?error=unavailable`);

  const response = NextResponse.redirect(
    buildAuthorizeUrl({
      authorizationEndpoint: auth.authorizationEndpoint,
      clientId,
      redirectUri: customerAccountRedirectUri(),
      state: handshake.state,
      nonce: handshake.nonce,
      codeChallenge: codeChallengeFor(handshake.verifier),
      locale,
    }),
    303,
  );
  response.cookies.set(OAUTH_COOKIE, sealed, oauthCookieOptions());
  return response;
}
