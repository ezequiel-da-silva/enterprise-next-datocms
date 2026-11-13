import type { AppLocale } from "@/constants/i18n";
import { toDatoSiteLocale } from "@/constants/i18n";
import { cdaFetchCache } from "@/infra/datocms/cda-fetch-cache";
import { datocmsFetch } from "@/infra/datocms/client";
import { GET_UI_STRINGS } from "@/infra/datocms/ui-strings-query";
import { logWarnThrottled } from "@/infra/observability/log-error";
import { DATOCMS_CACHE_TAGS } from "@/lib/datocms/revalidate-tags";
import { ACCOUNT_COPY, type AccountCopy } from "@/lib/i18n/account-copy";
import { CART_COPY, type CartCopy } from "@/lib/i18n/cart-copy";
import {
  CATALOG_FILTERS_COPY,
  type CatalogFiltersCopy,
} from "@/lib/i18n/catalog-filters-copy";
import { COLLECTION_COPY, type CollectionCopy } from "@/lib/i18n/collection-copy";
import { CONSENT_COPY, type ConsentCopy } from "@/lib/i18n/consent-copy";
import {
  ORDER_CONFIRMATION_COPY,
  resolveOrderLabel,
  type OrderConfirmationCopy,
} from "@/lib/i18n/order-confirmation-copy";
import { PDP_COPY, type PdpCopy, resolveLowStockMessage } from "@/lib/i18n/pdp-copy";
import {
  PRODUCTS_SECTION_COPY,
  resolveProductsPageOf,
  type ProductsSectionCmsCopy,
  type ProductsSectionCopy,
} from "@/lib/i18n/products-section-copy";
import { VIDEO_UI_COPY, type VideoUiCopy } from "@/lib/i18n/video-ui-copy";
import { WISHLIST_COPY, type WishlistCopy } from "@/lib/i18n/wishlist-copy";
import { cleanOverride, pickOverrides } from "@/lib/i18n/merge-copy";
import { resolveAccountCopy, resolveCartCopy, resolveConsentCopy } from "@/lib/i18n/resolve-ui-copy";
import {
  CATALOG_FILTERS_FIELDS,
  COLLECTION_FIELDS,
  ORDER_CONFIRMATION_TEXT_FIELDS,
  PDP_LOW_STOCK_FIELD,
  PDP_TEXT_FIELDS,
  PRODUCTS_SECTION_CMS_FIELDS,
  VIDEO_UI_FIELDS,
  WISHLIST_TEXT_FIELDS,
  type UiStringsRecord,
} from "@/lib/i18n/ui-strings-fields";
import { cache } from "react";

/**
 * Editable interface texts (singleton `ui_string`). Every getter falls back to the built-in
 * copy in `src/lib/i18n/*-copy.ts`, so a CMS error, an unmigrated environment or an empty field
 * never blanks the UI. Published content only: the model has no draft mode.
 */

type UiStringsQueryResult = { uiString: UiStringsRecord | null };

const loadUiStrings = cache(async (locale: AppLocale): Promise<UiStringsRecord | null> => {
  const result = await datocmsFetch<UiStringsQueryResult>({
    query: GET_UI_STRINGS,
    variables: { locale: toDatoSiteLocale(locale) },
    ...cdaFetchCache({
      includeDrafts: false,
      tags: [DATOCMS_CACHE_TAGS.uiStrings, `ui-strings:${locale}`],
      revalidate: 300,
    }),
  });
  if ("errors" in result) {
    logWarnThrottled(`ui-strings:${locale}`, "datocms.ui-strings", "ui_string unavailable; using built-in copy", {
      detail: result.errors[0]?.message?.slice(0, 200),
      context: { locale },
    });
    return null;
  }
  return result.data.uiString;
});

export async function getConsentCopy(locale: AppLocale): Promise<ConsentCopy> {
  return resolveConsentCopy(CONSENT_COPY[locale], await loadUiStrings(locale));
}

export async function getCartCopy(locale: AppLocale): Promise<CartCopy> {
  return resolveCartCopy(CART_COPY[locale], await loadUiStrings(locale));
}

export async function getAccountCopy(locale: AppLocale): Promise<AccountCopy> {
  return resolveAccountCopy(ACCOUNT_COPY[locale], await loadUiStrings(locale));
}

export async function getPdpCopy(locale: AppLocale): Promise<PdpCopy> {
  const base = PDP_COPY[locale];
  const record = await loadUiStrings(locale);
  const template = cleanOverride(record?.[PDP_LOW_STOCK_FIELD]) ?? base.lowStockTemplate;
  return {
    ...base,
    ...pickOverrides(PDP_TEXT_FIELDS, record),
    lowStockTemplate: template,
    lowStock: (count) => resolveLowStockMessage(template, count),
  };
}

export async function getWishlistCopy(locale: AppLocale): Promise<WishlistCopy> {
  const base = WISHLIST_COPY[locale];
  return {
    ...base,
    ...pickOverrides(WISHLIST_TEXT_FIELDS, await loadUiStrings(locale)),
  };
}

export async function getCollectionCopy(locale: AppLocale): Promise<CollectionCopy> {
  return {
    ...COLLECTION_COPY[locale],
    ...pickOverrides(COLLECTION_FIELDS, await loadUiStrings(locale)),
  };
}

export async function getVideoUiCopy(locale: AppLocale): Promise<VideoUiCopy> {
  return {
    ...VIDEO_UI_COPY[locale],
    ...pickOverrides(VIDEO_UI_FIELDS, await loadUiStrings(locale)),
  };
}

export async function getOrderConfirmationCopy(locale: AppLocale): Promise<OrderConfirmationCopy> {
  const base = ORDER_CONFIRMATION_COPY[locale];
  const overrides = pickOverrides(ORDER_CONFIRMATION_TEXT_FIELDS, await loadUiStrings(locale));
  const template = base.orderLabelTemplate;
  return {
    ...base,
    ...overrides,
    orderLabelTemplate: template,
    orderLabel: (order) => resolveOrderLabel(template, order),
  };
}

export async function getProductsSectionCmsCopy(locale: AppLocale): Promise<ProductsSectionCmsCopy> {
  const base = PRODUCTS_SECTION_COPY[locale];
  return {
    empty: base.empty,
    pageOfTemplate: base.pageOfTemplate,
    ...pickOverrides(PRODUCTS_SECTION_CMS_FIELDS, await loadUiStrings(locale)),
  };
}

export async function getCatalogFiltersCopy(locale: AppLocale): Promise<CatalogFiltersCopy> {
  return {
    ...CATALOG_FILTERS_COPY[locale],
    ...pickOverrides(CATALOG_FILTERS_FIELDS, await loadUiStrings(locale)),
  };
}

export async function getProductsSectionCopy(locale: AppLocale): Promise<ProductsSectionCopy> {
  const base = PRODUCTS_SECTION_COPY[locale];
  const cms = await getProductsSectionCmsCopy(locale);
  return {
    ...base,
    empty: cms.empty,
    pageOfTemplate: cms.pageOfTemplate,
    page: (page, total) => resolveProductsPageOf(cms.pageOfTemplate, page, total),
  };
}
