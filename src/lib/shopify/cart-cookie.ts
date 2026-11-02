export const CART_COOKIE = "nd-cart";

/** Header badge quantity. Written by cart actions so the layout does not call the Storefront API. */
export const CART_COUNT_COOKIE = "nd-cart-count";

const CART_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 14;
const CART_COUNT_MAX = 999;

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

/** Integer 0–999 from `nd-cart-count`. Missing or tampered values read as 0. */
export function readCartCountCookie(value: string | undefined): number {
  if (!value || !/^\d{1,3}$/.test(value)) return 0;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed <= CART_COUNT_MAX ? parsed : 0;
}
