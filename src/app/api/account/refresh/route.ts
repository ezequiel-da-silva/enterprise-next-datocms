import { linkCookieCart, localeFromPath, redirectTo, safeNextPath } from "@/app/api/account/account-route-utils";
import { DEFAULT_APP_LOCALE } from "@/constants/i18n";
import { refreshCustomerTokens, sessionFromTokens } from "@/infra/shopify/customer-account";
import {
  accountPath,
  CUSTOMER_COOKIE,
  customerCookieOptions,
  isCustomerAccountEnabled,
  readCustomerSession,
  sealCustomerSession,
} from "@/lib/shopify/customer-session";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Server Components can't write cookies, so pages bounce here when the access token is about to
 * expire. Failure clears the session (the page then shows the logged-out state).
 */
export async function GET(request: NextRequest) {
  if (!isCustomerAccountEnabled()) return new NextResponse(null, { status: 404 });
  const next = safeNextPath(request.nextUrl.searchParams.get("next")) ?? accountPath(DEFAULT_APP_LOCALE);
  const response = redirectTo(request, next);

  const session = readCustomerSession(request.cookies.get(CUSTOMER_COOKIE)?.value);
  const tokens = session?.refreshToken ? await refreshCustomerTokens(session.refreshToken) : null;
  const updated = tokens ? sessionFromTokens(tokens, session) : null;
  const sealed = updated ? sealCustomerSession(updated) : null;
  if (!updated || !sealed) {
    response.cookies.delete(CUSTOMER_COOKIE);
    return response;
  }

  await linkCookieCart(request, updated.accessToken, localeFromPath(next));
  response.cookies.set(CUSTOMER_COOKIE, sealed, customerCookieOptions());
  return response;
}
