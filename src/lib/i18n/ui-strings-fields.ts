import type { AccountCopy, AccountErrorCode } from "@/lib/i18n/account-copy";
import type { CartCopy } from "@/lib/i18n/cart-copy";
import type { ConsentCopy } from "@/lib/i18n/consent-copy";

/**
 * Maps each built-in copy key to its CDA field on the `ui_string` singleton.
 * `satisfies` keeps these maps in sync with the copy types: adding a key to a `*-copy.ts` type
 * without a field here fails typecheck. The Dato migration (`uiStringsSingleton`) creates the
 * same fields (snake_case api keys); `ui-strings-fields.test.ts` guards that.
 */

export const CONSENT_FIELDS = {
  title: "cookiesTitle",
  description: "cookiesDescription",
  acceptAll: "cookiesAcceptAll",
  rejectNonEssential: "cookiesRejectNonEssential",
  privacyPolicy: "cookiesPrivacyPolicy",
  manage: "cookiesManage",
} as const satisfies Record<keyof ConsentCopy, string>;

export const CART_FIELDS = {
  title: "cartTitle",
  addToCart: "cartAddToCart",
  adding: "cartAdding",
  added: "cartAdded",
  viewCart: "cartViewCart",
  soldOut: "cartSoldOut",
  errorGeneric: "cartErrorGeneric",
  errorRateLimit: "cartErrorRateLimit",
  empty: "cartEmpty",
  continueShopping: "cartContinueShopping",
  quantity: "cartQuantity",
  each: "cartEach",
  update: "cartUpdate",
  remove: "cartRemove",
  subtotal: "cartSubtotal",
  checkout: "cartCheckout",
  checkoutNote: "cartCheckoutNote",
  checkoutUnavailable: "cartCheckoutUnavailable",
} as const satisfies Record<Exclude<keyof CartCopy, "linkLabel">, string>;

/** `{count}` templates replacing `CartCopy.linkLabel(count)`; both are needed to override. */
export const CART_LINK_FIELDS = {
  one: "cartLinkLabelOne",
  other: "cartLinkLabelOther",
} as const;

export const ACCOUNT_FIELDS = {
  title: "accountTitle",
  description: "accountDescription",
  signedOutIntro: "accountSignedOutIntro",
  signIn: "accountSignIn",
  signOut: "accountSignOut",
  ordersTitle: "accountOrdersTitle",
  noOrders: "accountNoOrders",
  viewOrder: "accountViewOrder",
  viewOrderHint: "accountViewOrderHint",
  loadError: "accountLoadError",
} as const satisfies Record<
  Exclude<keyof AccountCopy, "errors" | "financialStatus" | "greeting" | "linkLabel">,
  string
>;

export const ACCOUNT_ERROR_FIELDS = {
  login: "accountErrorLogin",
  rate: "accountErrorRate",
  unavailable: "accountErrorUnavailable",
} as const satisfies Record<AccountErrorCode, string>;

/** `{name}` template and the two header-link labels. */
export const ACCOUNT_TEMPLATE_FIELDS = {
  greeting: "accountGreeting",
  greetingAnonymous: "accountGreetingAnonymous",
  linkSignedIn: "accountLinkLabelSignedIn",
  linkSignedOut: "accountLinkLabelSignedOut",
} as const;

export const UI_STRINGS_FIELD_NAMES = [
  ...Object.values(CONSENT_FIELDS),
  ...Object.values(CART_FIELDS),
  ...Object.values(CART_LINK_FIELDS),
  ...Object.values(ACCOUNT_FIELDS),
  ...Object.values(ACCOUNT_ERROR_FIELDS),
  ...Object.values(ACCOUNT_TEMPLATE_FIELDS),
] as const;

export type UiStringsFieldName = (typeof UI_STRINGS_FIELD_NAMES)[number];

/** Raw `ui_string` record as returned by the CDA (all fields optional and nullable). */
export type UiStringsRecord = Partial<Record<UiStringsFieldName, string | null>>;
