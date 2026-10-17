"use server";

import { DEFAULT_APP_LOCALE, isAppLocale, type AppLocale } from "@/constants/i18n";
import {
  addToCartSchema,
  cartIdSchema,
  removeCartLineSchema,
  updateCartLineSchema,
  type CartActionState,
  type CartSnapshot,
} from "@/core/entities/cart";
import {
  addCartLines,
  createCart,
  getCartFromCookie,
  removeCartLines,
  updateCartLines,
  type CartMutationResult,
} from "@/infra/shopify/cart";
import { logError } from "@/infra/observability/log-error";
import { getCartCopy } from "@/infra/datocms/get-ui-strings";
import { getClientIpKey } from "@/lib/security/client-ip";
import { checkRateLimit } from "@/infra/security/rate-limit";
import { toCartSnapshot } from "@/lib/shopify/cart-snapshot";
import { CART_COOKIE, cartCookieOptions, isCartEnabled } from "@/lib/shopify/cart-cookie";
import { activeAccessToken, CUSTOMER_COOKIE, readCustomerSession } from "@/lib/shopify/customer-session";
import { refresh } from "next/cache";
import { cookies } from "next/headers";

const CART_RATE_LIMIT = { limit: 20, windowMs: 60_000 };

function readLocale(formData: FormData): AppLocale {
  const raw = String(formData.get("locale") ?? "");
  return isAppLocale(raw) ? raw : DEFAULT_APP_LOCALE;
}

async function readCartId(): Promise<string | null> {
  const parsed = cartIdSchema.safeParse((await cookies()).get(CART_COOKIE)?.value ?? "");
  return parsed.success ? parsed.data : null;
}

async function persist(result: CartMutationResult, action: string): Promise<void> {
  if (!result.ok) {
    logError("action.cart", "Cart mutation failed", { context: { action } });
    return;
  }
  (await cookies()).set(CART_COOKIE, result.cart.id, cartCookieOptions());
  refresh();
}

/** Flag + rate limit shared by every cart action. */
async function guard(): Promise<"ok" | "disabled" | "limited"> {
  if (!isCartEnabled()) return "disabled";
  const rate = await checkRateLimit(await getClientIpKey("cart"), CART_RATE_LIMIT);
  return rate.ok ? "ok" : "limited";
}

export async function addToCart(_prev: CartActionState, formData: FormData): Promise<CartActionState> {
  const locale = readLocale(formData);
  const copy = await getCartCopy(locale);
  const gate = await guard();
  if (gate === "limited") return { status: "error", message: copy.errorRateLimit };
  if (gate === "disabled") return { status: "error", message: copy.errorGeneric };

  const input = addToCartSchema.safeParse({
    variantId: formData.get("variantId"),
    quantity: formData.get("quantity") ?? 1,
  });
  if (!input.success) return { status: "error", message: copy.errorGeneric };

  const lines = [{ merchandiseId: input.data.variantId, quantity: input.data.quantity }];
  const cartId = await readCartId();
  let result: CartMutationResult = cartId ? await addCartLines(cartId, lines, locale) : { ok: false };
  if (!result.ok) {
    const session = readCustomerSession((await cookies()).get(CUSTOMER_COOKIE)?.value);
    result = await createCart(lines, locale, activeAccessToken(session));
  }
  if (!result.ok) {
    logError("action.cart", "Cart create failed after add fallback", { context: { action: "add" } });
    return { status: "error", message: copy.errorGeneric };
  }

  await persist(result, "add");
  return {
    status: "success",
    message: copy.added,
    totalQuantity: result.cart.totalQuantity,
    cart: toCartSnapshot(result.cart),
  };
}

/** Fresh cart snapshot for the header quick-cart drawer. */
export async function getCartSnapshot(locale: AppLocale): Promise<CartSnapshot | null> {
  if (!isCartEnabled()) return null;
  const cookieStore = await cookies();
  const session = readCustomerSession(cookieStore.get(CUSTOMER_COOKIE)?.value);
  const cart = await getCartFromCookie(cookieStore.get(CART_COOKIE)?.value, locale, activeAccessToken(session));
  return cart ? toCartSnapshot(cart) : null;
}

export async function updateCartLine(formData: FormData): Promise<void> {
  if ((await guard()) !== "ok") return;
  const input = updateCartLineSchema.safeParse({
    lineId: formData.get("lineId"),
    quantity: formData.get("quantity"),
  });
  const cartId = await readCartId();
  if (!input.success || !cartId) return;
  const locale = readLocale(formData);
  const result =
    input.data.quantity === 0
      ? await removeCartLines(cartId, [input.data.lineId], locale)
      : await updateCartLines(cartId, [{ id: input.data.lineId, quantity: input.data.quantity }], locale);
  await persist(result, input.data.quantity === 0 ? "remove" : "update");
}

export async function removeCartLine(formData: FormData): Promise<void> {
  if ((await guard()) !== "ok") return;
  const input = removeCartLineSchema.safeParse({ lineId: formData.get("lineId") });
  const cartId = await readCartId();
  if (!input.success || !cartId) return;
  await persist(await removeCartLines(cartId, [input.data.lineId], readLocale(formData)), "remove");
}
