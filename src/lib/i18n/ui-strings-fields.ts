import type { AccountCopy, AccountErrorCode } from "@/lib/i18n/account-copy";
import type { CartCopy } from "@/lib/i18n/cart-copy";
import type { CatalogFiltersCopy } from "@/lib/i18n/catalog-filters-copy";
import type { CollectionCopy } from "@/lib/i18n/collection-copy";
import type { ConsentCopy } from "@/lib/i18n/consent-copy";
import type { OrderConfirmationCopy } from "@/lib/i18n/order-confirmation-copy";
import type { PdpCopy } from "@/lib/i18n/pdp-copy";
import type { ProductsSectionCmsCopy } from "@/lib/i18n/products-section-copy";
import type { VideoUiCopy } from "@/lib/i18n/video-ui-copy";
import type { WishlistCopy } from "@/lib/i18n/wishlist-copy";

/**
 * Maps each built-in copy key to its CDA field on the `ui_string` singleton.
 * `satisfies` keeps these maps in sync with the copy types: adding a key to a `*-copy.ts` type
 * without a field here fails typecheck. The Dato migration (`uiStringsSingleton`) creates the
 * same fields (snake_case api keys); `ui-strings-fields.test.ts` guards that.
 */

export const CONSENT_FIELDS = {
  title: "cookiesTitle",
  description: "cookiesDescription",
  essentialNote: "cookiesEssentialNote",
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
} as const satisfies Record<Exclude<keyof CartCopy, "linkLabel" | "closeDrawer">, string>;

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

export const PDP_LOW_STOCK_FIELD = "pdpLowStock";

/** String keys of `PdpCopy`, excluding the `{count}` template and the derived function. */
export const PDP_TEXT_FIELDS = {
  inStock: "pdpInStock",
  soldOut: "pdpSoldOut",
  viewImage: "pdpViewImage",
  unavailableSuffix: "pdpUnavailableSuffix",
  checkoutTrust: "pdpCheckoutTrust",
  paymentHint: "pdpPaymentHint",
  buyNow: "pdpBuyNow",
  buying: "pdpBuying",
  reviewsTitle: "pdpReviewsTitle",
  verifiedRider: "pdpVerifiedRider",
  reviewsAggregateTemplate: "pdpReviewsAggregateTemplate",
  specProfile: "pdpSpecProfile",
  specFlex: "pdpSpecFlex",
  specTerrain: "pdpSpecTerrain",
  specRiderLevel: "pdpSpecRiderLevel",
  specCore: "pdpSpecCore",
  sizeGuideSummary: "pdpSizeGuideSummary",
  sizeLength: "pdpSizeLength",
  sizeWeight: "pdpSizeWeight",
  sizeWaist: "pdpSizeWaist",
} as const satisfies Record<Exclude<keyof PdpCopy, "lowStock" | "lowStockTemplate">, string>;

export const COLLECTION_FIELDS = {
  empty: "collectionEmpty",
} as const satisfies Record<keyof CollectionCopy, string>;

export const WISHLIST_TEXT_FIELDS = {
  emptyTitle: "wishlistEmptyTitle",
  emptyDescription: "wishlistEmptyDescription",
  emptyCta: "wishlistEmptyCta",
} as const satisfies Record<
  Exclude<keyof WishlistCopy, "title" | "lead" | "add" | "remove" | "linkLabel">,
  string
>;

export const PRODUCTS_SECTION_CMS_FIELDS = {
  empty: "productsEmpty",
  pageOfTemplate: "paginationPageOf",
} as const satisfies Record<keyof ProductsSectionCmsCopy, string>;

export const VIDEO_UI_FIELDS = {
  videoDefaultLabel: "videoDefaultLabel",
  captionsDefaultLabel: "captionsDefaultLabel",
} as const satisfies Record<keyof VideoUiCopy, string>;

export const ORDER_CONFIRMATION_TEXT_FIELDS = {
  trackingNotice: "orderConfirmationTrackingNotice",
} as const satisfies Record<
  Exclude<keyof OrderConfirmationCopy, "orderLabel" | "title" | "lead" | "continueShopping" | "orderLabelTemplate">,
  string
>;

export const CATALOG_FILTERS_FIELDS = {
  clearFilters: "catalogClearFilters",
  inStockOnly: "catalogInStockOnly",
  sortLabel: "catalogSortLabel",
  sortRelevance: "catalogSortRelevance",
  sortPriceAsc: "catalogSortPriceAsc",
  sortPriceDesc: "catalogSortPriceDesc",
  resultsTemplate: "catalogResultsTemplate",
  filtersEmpty: "catalogFiltersEmpty",
  terrainLabel: "catalogTerrainLabel",
  profileLabel: "catalogProfileLabel",
  activeFiltersLabel: "catalogActiveFilters",
  filtersLabel: "catalogFiltersLabel",
  openFiltersLabel: "catalogOpenFilters",
  closeFiltersLabel: "catalogCloseFilters",
} as const satisfies Record<keyof CatalogFiltersCopy, string>;

export const UI_STRINGS_FIELD_NAMES = [
  ...Object.values(CONSENT_FIELDS),
  ...Object.values(CART_FIELDS),
  ...Object.values(CART_LINK_FIELDS),
  ...Object.values(ACCOUNT_FIELDS),
  ...Object.values(ACCOUNT_ERROR_FIELDS),
  ...Object.values(ACCOUNT_TEMPLATE_FIELDS),
  PDP_LOW_STOCK_FIELD,
  ...Object.values(PDP_TEXT_FIELDS),
  ...Object.values(COLLECTION_FIELDS),
  ...Object.values(WISHLIST_TEXT_FIELDS),
  ...Object.values(PRODUCTS_SECTION_CMS_FIELDS),
  ...Object.values(VIDEO_UI_FIELDS),
  ...Object.values(ORDER_CONFIRMATION_TEXT_FIELDS),
  ...Object.values(CATALOG_FILTERS_FIELDS),
] as const;

export type UiStringsFieldName = (typeof UI_STRINGS_FIELD_NAMES)[number];

/** Raw `ui_string` record as returned by the CDA (all fields optional and nullable). */
export type UiStringsRecord = Partial<Record<UiStringsFieldName, string | null>>;
