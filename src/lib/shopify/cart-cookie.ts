export const CART_COOKIE = "nd-cart";

const CART_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 14;

export function cartCookieOptions(isProduction = process.env.NODE_ENV === "production") {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge: CART_COOKIE_MAX_AGE_SEC,
  };
}

/** Server-only flag: cart UI, routes and actions stay off unless `SHOPIFY_CART_ENABLED` is `1`/`true`. */
export function isCartEnabled(): boolean {
  const raw = process.env.SHOPIFY_CART_ENABLED?.trim().toLowerCase();
  return raw === "1" || raw === "true";
}

export function cartPath(locale: string): string {
  return `/${locale}/cart`;
}
