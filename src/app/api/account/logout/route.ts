import { readLocaleParam } from "@/app/api/account/account-route-utils";
import { buildLogoutUrl, discoverCustomerAuth } from "@/infra/shopify/customer-account";
import { getSiteBaseUrl } from "@/lib/seo/site-config";
import { CART_COOKIE } from "@/lib/shopify/cart-cookie";
import { CUSTOMER_COOKIE, OAUTH_COOKIE, readCustomerSession } from "@/lib/shopify/customer-session";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET (not a form POST): CSP `form-action 'self'` blocks a form submit that redirects to Shopify.
 * Also drops `nd-cart`, which carries the customer token, so a shared device checks out as guest.
 */
export async function GET(request: NextRequest) {
  const locale = readLocaleParam(request);
  const session = readCustomerSession(request.cookies.get(CUSTOMER_COOKIE)?.value);
  const auth = session ? await discoverCustomerAuth() : null;
  const home = `${getSiteBaseUrl()}/${locale}`;
  const target =
    session && auth ? buildLogoutUrl(auth.endSessionEndpoint, session.idToken, home) : new URL(`/${locale}`, request.nextUrl.origin);

  const response = NextResponse.redirect(target, 303);
  for (const name of [CUSTOMER_COOKIE, CART_COOKIE, OAUTH_COOKIE]) response.cookies.delete(name);
  return response;
}
