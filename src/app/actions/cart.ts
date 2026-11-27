"use server";

import { DEFAULT_APP_LOCALE, isAppLocale, type AppLocale } from "@/constants/i18n";
import {
  addToCartSchema,
  cartIdSchema,
  removeCartLineSchema,
  updateCartLineSchema,
  type BuyNowActionState,
  type CartActionState,
  type CartSnapshot,
} from "@/core/entities/cart";
import {
  addCartLines,
  createCart,
  getCartFromCookie,
  removeCartLines,
  updateCartAttributes,
  updateCartLines,
  type CartMutationResult,
} from "@/infra/shopify/cart";
import { logError } from "@/infra/observability/log-error";
import { getCartCopy } from "@/infra/datocms/get-ui-strings";
import { GA_CLIENT_ID_CART_ATTR, GA_CLIENT_ID_COOKIE, isValidGaClientId } from "@/lib/analytics/ga-client-id";
import { getClientIpKey } from "@/lib/security/client-ip";
import { checkRateLimit } from "@/infra/security/rate-limit";
import { toCartSnapshot } from "@/lib/shopify/cart-snapshot";
import { CART_COOKIE, CART_COUNT_COOKIE, cartCookieOptions, isCartEnabled } from "@/lib/shopify/cart-cookie";
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

async function readGaClientIdFromJar(): Promise<string | null> {
  const raw = (await cookies()).get(GA_CLIENT_ID_COOKIE)?.value ?? "";
  return isValidGaClientId(raw) ? raw.trim() : null;
}

function gaClientIdAttributes(clientId: string | null): { key: string; value: string }[] | undefined {
  return clientId ? [{ key: GA_CLIENT_ID_CART_ATTR, value: clientId }] : undefined;
}

/** After consent, stamp `ga_client_id` on an existing cart (idempotent). Failures are non-fatal. */
async function ensureGaClientIdAttribute(cartId: string, locale: AppLocale): Promise<void> {
  const clientId = await readGaClientIdFromJar();
  if (!clientId) return;
  const result = await updateCartAttributes(cartId, [{ key: GA_CLIENT_ID_CART_ATTR, value: clientId }], locale);
  if (!result.ok) {
    logError("action.cart", "GA client_id cart attribute update failed", { context: { action: "ga_attr" } });
  }
}

/**
 * Called when analytics consent is granted after a cart already exists.
 * Reads `nd-ga-cid` + cart cookie; no-op when either is missing. Never throws to the client.
 */
export async function stampGaClientIdOnExistingCart(locale: AppLocale): Promise<void> {
  if (!isCartEnabled()) return;
  if (!isAppLocale(locale)) return;
  try {
    const cartId = await readCartId();
    if (!cartId) return;
    await ensureGaClientIdAttribute(cartId, locale);
  } catch {
    logError("action.cart", "GA client_id consent stamp failed", { context: { action: "ga_consent_stamp" } });
  }
}

async function persist(
  result: CartMutationResult,
  action: string,
  opts?: { locale?: AppLocale; /** Skip when createCart already sent `ga_client_id`. */ skipGaStamp?: boolean },
): Promise<void> {
  if (!result.ok) {
    logError("action.cart", "Cart mutation failed", { context: { action } });
    return;
  }
  if (opts?.locale && !opts.skipGaStamp) await ensureGaClientIdAttribute(result.cart.id, opts.locale);
  const jar = await cookies();
  const options = cartCookieOptions();
  jar.set(CART_COOKIE, result.cart.id, options);
  jar.set(CART_COUNT_COOKIE, String(result.cart.totalQuantity), options);
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
  const gaAttrs = gaClientIdAttributes(await readGaClientIdFromJar());
  let stampedGaOnCreate = false;
  let result: CartMutationResult = cartId ? await addCartLines(cartId, lines, locale) : { ok: false };
  if (!result.ok) {
    const session = readCustomerSession((await cookies()).get(CUSTOMER_COOKIE)?.value);
    result = await createCart(lines, locale, activeAccessToken(session), gaAttrs);
    stampedGaOnCreate = Boolean(gaAttrs?.length);
  }
  if (!result.ok) {
    logError("action.cart", "Cart create failed after add fallback", { context: { action: "add" } });
    return { status: "error", message: copy.errorGeneric };
  }

  await persist(result, "add", { locale, skipGaStamp: stampedGaOnCreate });
  return {
    status: "success",
    message: copy.added,
    totalQuantity: result.cart.totalQuantity,
    cart: toCartSnapshot(result.cart),
  };
}

/**
 * One-shot checkout cart for the selected variant.
 * Does **not** write `nd-cart` — the browsing drawer cart stays intact.
 */
export async function buyNow(_prev: BuyNowActionState, formData: FormData): Promise<BuyNowActionState> {
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

  const session = readCustomerSession((await cookies()).get(CUSTOMER_COOKIE)?.value);
  const gaAttrs = gaClientIdAttributes(await readGaClientIdFromJar());
  const result = await createCart(
    [{ merchandiseId: input.data.variantId, quantity: input.data.quantity }],
    locale,
    activeAccessToken(session),
    gaAttrs,
  );
  if (!result.ok || !result.cart.checkoutUrl) {
    logError("action.cart", "Buy now cart create failed", { context: { action: "buyNow" } });
    return { status: "error", message: copy.errorGeneric };
  }

  const snapshot = toCartSnapshot(result.cart);
  const currency = snapshot.subtotal?.currencyCode ?? "USD";
  const value = Number(snapshot.subtotal?.amount) || 0;
  return {
    status: "success",
    checkoutUrl: result.cart.checkoutUrl,
    currency,
    value,
    items: snapshot.lines.map((line) => ({
      item_id: line.productHandle,
      item_name: line.productTitle,
      price: Number(line.unitPrice.amount) || 0,
      quantity: line.quantity,
      item_variant: line.variantTitle ?? undefined,
    })),
  };
}

/** Fresh cart snapshot for the header quick-cart drawer. */
export async function getCartSnapshot(locale: AppLocale): Promise<CartSnapshot | null> {
  if (!isCartEnabled()) return null;
  const cookieStore = await cookies();
  const session = readCustomerSession(cookieStore.get(CUSTOMER_COOKIE)?.value);
  const cart = await getCartFromCookie(cookieStore.get(CART_COOKIE)?.value, locale, activeAccessToken(session));
  if (!cart) {
    cookieStore.delete(CART_COUNT_COOKIE);
    return null;
  }
  cookieStore.set(CART_COUNT_COOKIE, String(cart.totalQuantity), cartCookieOptions());
  return toCartSnapshot(cart);
}

async function updateCartLineMutation(formData: FormData): Promise<CartSnapshot | null> {
  if ((await guard()) !== "ok") return null;
  const input = updateCartLineSchema.safeParse({
    lineId: formData.get("lineId"),
    quantity: formData.get("quantity"),
  });
  const cartId = await readCartId();
  if (!input.success || !cartId) return null;
  const locale = readLocale(formData);
  const result =
    input.data.quantity === 0
      ? await removeCartLines(cartId, [input.data.lineId], locale)
      : await updateCartLines(cartId, [{ id: input.data.lineId, quantity: input.data.quantity }], locale);
  await persist(result, input.data.quantity === 0 ? "remove" : "update", { locale });
  return result.ok ? toCartSnapshot(result.cart) : null;
}

async function removeCartLineMutation(formData: FormData): Promise<CartSnapshot | null> {
  if ((await guard()) !== "ok") return null;
  const input = removeCartLineSchema.safeParse({ lineId: formData.get("lineId") });
  const cartId = await readCartId();
  if (!input.success || !cartId) return null;
  const locale = readLocale(formData);
  const result = await removeCartLines(cartId, [input.data.lineId], locale);
  await persist(result, "remove", { locale });
  return result.ok ? toCartSnapshot(result.cart) : null;
}

export async function updateCartLine(formData: FormData): Promise<void> {
  await updateCartLineMutation(formData);
}

export async function removeCartLine(formData: FormData): Promise<void> {
  await removeCartLineMutation(formData);
}

/** Quick-cart drawer: returns fresh snapshot for `useActionState`. */
export async function updateCartLineForDrawer(
  _prev: CartSnapshot | null,
  formData: FormData,
): Promise<CartSnapshot | null> {
  return updateCartLineMutation(formData);
}

export async function removeCartLineForDrawer(
  _prev: CartSnapshot | null,
  formData: FormData,
): Promise<CartSnapshot | null> {
  return removeCartLineMutation(formData);
}
