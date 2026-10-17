import type { AppLocale } from "@/constants/i18n";
import { toDatoSiteLocale } from "@/constants/i18n";
import { cdaFetchCache } from "@/infra/datocms/cda-fetch-cache";
import { datocmsFetch } from "@/infra/datocms/client";
import { GET_UI_STRINGS } from "@/infra/datocms/ui-strings-query";
import { logWarnThrottled } from "@/infra/observability/log-error";
import { DATOCMS_CACHE_TAGS } from "@/lib/datocms/revalidate-tags";
import { ACCOUNT_COPY, type AccountCopy } from "@/lib/i18n/account-copy";
import { CART_COPY, type CartCopy } from "@/lib/i18n/cart-copy";
import { CONSENT_COPY, type ConsentCopy } from "@/lib/i18n/consent-copy";
import { PDP_COPY, type PdpCopy, resolveLowStockMessage } from "@/lib/i18n/pdp-copy";
import { cleanOverride } from "@/lib/i18n/merge-copy";
import { resolveAccountCopy, resolveCartCopy, resolveConsentCopy } from "@/lib/i18n/resolve-ui-copy";
import { PDP_LOW_STOCK_FIELD, type UiStringsRecord } from "@/lib/i18n/ui-strings-fields";
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
  const template =
    record && PDP_LOW_STOCK_FIELD in record
      ? (cleanOverride(record[PDP_LOW_STOCK_FIELD as keyof typeof record]) ?? base.lowStockTemplate)
      : base.lowStockTemplate;
  return {
    lowStockTemplate: template,
    lowStock: (count) => resolveLowStockMessage(template, count),
  };
}