import type { AppLocale } from "@/constants/i18n";
import { cartIdSchema } from "@/core/entities/cart";
import {
  asRecord,
  readImage,
  readMoney,
  readSelectedOptions,
  storefrontGraphql,
  storefrontShopDomain,
  type StorefrontMoney,
  type StorefrontProductImage,
  type StorefrontSelectedOption,
} from "@/infra/shopify/storefront";
import { safeCheckoutUrl } from "@/lib/shopify/checkout-url";
import { shopifyCountryFromLocale } from "@/lib/shopify/locale-map";

export type StorefrontCartLine = {
  id: string;
  quantity: number;
  total: StorefrontMoney;
  variantId: string;
  variantTitle: string;
  selectedOptions: StorefrontSelectedOption[];
  image: StorefrontProductImage | null;
  unitPrice: StorefrontMoney;
  productTitle: string;
  productHandle: string;
};

export type StorefrontCart = {
  id: string;
  /** Already validated with `safeCheckoutUrl`; `null` when the host is not allowed. */
  checkoutUrl: string | null;
  totalQuantity: number;
  /** `buyerIdentity.countryCode` — sets the cart currency (Markets). */
  countryCode: string | null;
  subtotal: StorefrontMoney | null;
  total: StorefrontMoney | null;
  lines: StorefrontCartLine[];
};

export type CartMutationResult = { ok: true; cart: StorefrontCart } | { ok: false };

const CART_FIELDS = `
  id
  checkoutUrl
  totalQuantity
  buyerIdentity { countryCode }
  cost {
    subtotalAmount { amount currencyCode }
    totalAmount { amount currencyCode }
  }
  lines(first: 100) {
    nodes {
      id
      quantity
      cost {
        totalAmount { amount currencyCode }
        amountPerQuantity { amount currencyCode }
      }
      merchandise {
        ... on ProductVariant {
          id
          title
          selectedOptions { name value }
          image { url altText width height }
          product { title handle }
        }
      }
    }
  }
`;

const CART_QUERY = /* GraphQL */ `
  query Cart($id: ID!, $country: CountryCode!) @inContext(country: $country) {
    cart(id: $id) { ${CART_FIELDS} }
  }
`;

const CART_CREATE = /* GraphQL */ `
  mutation CartCreate($input: CartInput!, $country: CountryCode!) @inContext(country: $country) {
    cartCreate(input: $input) {
      cart { ${CART_FIELDS} }
      userErrors { field message }
    }
  }
`;

const CART_LINES_ADD = /* GraphQL */ `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!, $country: CountryCode!)
  @inContext(country: $country) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ${CART_FIELDS} }
      userErrors { field message }
    }
  }
`;

const CART_LINES_UPDATE = /* GraphQL */ `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!, $country: CountryCode!)
  @inContext(country: $country) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ${CART_FIELDS} }
      userErrors { field message }
    }
  }
`;

const CART_LINES_REMOVE = /* GraphQL */ `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!, $country: CountryCode!)
  @inContext(country: $country) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ${CART_FIELDS} }
      userErrors { field message }
    }
  }
`;

const CART_BUYER_IDENTITY_UPDATE = /* GraphQL */ `
  mutation CartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!, $country: CountryCode!)
  @inContext(country: $country) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart { ${CART_FIELDS} }
      userErrors { field message }
    }
  }
`;

function readLine(value: unknown): StorefrontCartLine | null {
  const record = asRecord(value);
  const merchandise = asRecord(record?.merchandise);
  const product = asRecord(merchandise?.product);
  if (!record || !merchandise || !product) return null;
  if (typeof record.id !== "string" || typeof record.quantity !== "number") return null;
  if (typeof merchandise.id !== "string" || typeof product.handle !== "string") return null;
  const cost = asRecord(record.cost);
  const total = readMoney(cost?.totalAmount);
  /* Per-line cost, not `merchandise.price`: it reflects line discounts and the market price. */
  const unitPrice = readMoney(cost?.amountPerQuantity);
  if (!total || !unitPrice) return null;
  return {
    id: record.id,
    quantity: record.quantity,
    total,
    variantId: merchandise.id,
    variantTitle: typeof merchandise.title === "string" ? merchandise.title : "",
    selectedOptions: readSelectedOptions(merchandise.selectedOptions),
    image: readImage(merchandise.image),
    unitPrice,
    productTitle: typeof product.title === "string" ? product.title : product.handle,
    productHandle: product.handle,
  };
}

function readCountryCode(value: unknown): string | null {
  const code = asRecord(value)?.countryCode;
  return typeof code === "string" && code ? code : null;
}

export function mapCart(value: unknown): StorefrontCart | null {
  const record = asRecord(value);
  if (!record || typeof record.id !== "string") return null;
  const cost = asRecord(record.cost);
  const nodes = asRecord(record.lines)?.nodes;
  return {
    id: record.id,
    checkoutUrl: safeCheckoutUrl(typeof record.checkoutUrl === "string" ? record.checkoutUrl : null, [
      storefrontShopDomain(),
      process.env.SHOPIFY_CHECKOUT_DOMAIN,
    ]),
    totalQuantity: typeof record.totalQuantity === "number" ? record.totalQuantity : 0,
    countryCode: readCountryCode(record.buyerIdentity),
    subtotal: readMoney(cost?.subtotalAmount),
    total: readMoney(cost?.totalAmount),
    lines: Array.isArray(nodes) ? nodes.map(readLine).filter((l): l is StorefrontCartLine => l !== null) : [],
  };
}

async function runMutation(
  field: string,
  query: string,
  variables: Record<string, unknown>,
): Promise<CartMutationResult> {
  const json = await storefrontGraphql(query, variables);
  const payload = asRecord(asRecord(json?.data)?.[field]);
  const userErrors = payload?.userErrors;
  if (!payload || (Array.isArray(userErrors) && userErrors.length > 0)) return { ok: false };
  const cart = mapCart(payload.cart);
  return cart ? { ok: true, cart } : { ok: false };
}

/**
 * The cart currency follows `buyerIdentity.countryCode` set at creation, not `@inContext`.
 * When the visitor switches locale (e.g. /en → /pt), move the cart to that locale's market.
 */
export async function getCart(
  cartId: string,
  locale: AppLocale,
  customerAccessToken?: string | null,
): Promise<StorefrontCart | null> {
  const country = shopifyCountryFromLocale(locale);
  const json = await storefrontGraphql(CART_QUERY, { id: cartId, country });
  const cart = mapCart(asRecord(json?.data)?.cart);
  if (!cart || !cart.countryCode || cart.countryCode === country) return cart;
  const synced = await runMutation("cartBuyerIdentityUpdate", CART_BUYER_IDENTITY_UPDATE, {
    cartId,
    buyerIdentity: customerAccessToken ? { countryCode: country, customerAccessToken } : { countryCode: country },
    country,
  });
  return synced.ok ? synced.cart : cart;
}

/** Cart from the raw `nd-cart` cookie value; invalid or expired ids resolve to `null`. */
export async function getCartFromCookie(
  cookieValue: string | undefined,
  locale: AppLocale,
  customerAccessToken?: string | null,
): Promise<StorefrontCart | null> {
  const parsed = cartIdSchema.safeParse(cookieValue ?? "");
  return parsed.success ? getCart(parsed.data, locale, customerAccessToken) : null;
}

/** `customerAccessToken` (Customer Account API token) makes checkout open logged in. */
export function createCart(
  lines: { merchandiseId: string; quantity: number }[],
  locale: AppLocale,
  customerAccessToken?: string | null,
): Promise<CartMutationResult> {
  const country = shopifyCountryFromLocale(locale);
  const buyerIdentity = customerAccessToken ? { countryCode: country, customerAccessToken } : { countryCode: country };
  return runMutation("cartCreate", CART_CREATE, { input: { lines, buyerIdentity }, country });
}

/** Attaches a logged-in customer to an existing cart; call again after every token refresh. */
export function linkCartToCustomer(
  cartId: string,
  customerAccessToken: string,
  locale: AppLocale,
): Promise<CartMutationResult> {
  const country = shopifyCountryFromLocale(locale);
  return runMutation("cartBuyerIdentityUpdate", CART_BUYER_IDENTITY_UPDATE, {
    cartId,
    buyerIdentity: { countryCode: country, customerAccessToken },
    country,
  });
}

export function addCartLines(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[],
  locale: AppLocale,
): Promise<CartMutationResult> {
  return runMutation("cartLinesAdd", CART_LINES_ADD, { cartId, lines, country: shopifyCountryFromLocale(locale) });
}

export function updateCartLines(
  cartId: string,
  lines: { id: string; quantity: number }[],
  locale: AppLocale,
): Promise<CartMutationResult> {
  return runMutation("cartLinesUpdate", CART_LINES_UPDATE, { cartId, lines, country: shopifyCountryFromLocale(locale) });
}

export function removeCartLines(cartId: string, lineIds: string[], locale: AppLocale): Promise<CartMutationResult> {
  return runMutation("cartLinesRemove", CART_LINES_REMOVE, { cartId, lineIds, country: shopifyCountryFromLocale(locale) });
}
