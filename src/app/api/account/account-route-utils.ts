import { APP_LOCALES, DEFAULT_APP_LOCALE, isAppLocale, type AppLocale } from "@/constants/i18n";
import { cartIdSchema } from "@/core/entities/cart";
import { linkCartToCustomer } from "@/infra/shopify/cart";
import { CART_COOKIE } from "@/lib/shopify/cart-cookie";
import { NextResponse, type NextRequest } from "next/server";

const NEXT_PATH = new RegExp(`^/(${APP_LOCALES.join("|")})(/[A-Za-z0-9_~%-][A-Za-z0-9._~%-]*)*/?$`);

export function readLocaleParam(request: NextRequest): AppLocale {
  const raw = request.nextUrl.searchParams.get("locale") ?? "";
  return isAppLocale(raw) ? raw : DEFAULT_APP_LOCALE;
}

/** Only same-site, locale-prefixed paths — never `//host` or absolute URLs (no open redirect). */
export function safeNextPath(raw: string | null): string | null {
  return raw && NEXT_PATH.test(raw) ? raw : null;
}

export function localeFromPath(path: string): AppLocale {
  const segment = path.split("/")[1] ?? "";
  return isAppLocale(segment) ? segment : DEFAULT_APP_LOCALE;
}

export function redirectTo(request: NextRequest, path: string): NextResponse {
  return NextResponse.redirect(new URL(path, request.nextUrl.origin), 303);
}

export function clientIpKey(request: NextRequest, prefix: string): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return `${prefix}:${forwarded || request.headers.get("x-real-ip")?.trim() || "unknown"}`;
}

/** Re-attach the customer to the `nd-cart` cart after login / token refresh (best effort). */
export async function linkCookieCart(request: NextRequest, accessToken: string, locale: AppLocale): Promise<void> {
  const parsed = cartIdSchema.safeParse(request.cookies.get(CART_COOKIE)?.value ?? "");
  if (parsed.success) await linkCartToCustomer(parsed.data, accessToken, locale);
}
