import type { AccountCopy } from "@/lib/i18n/account-copy";
import type { CartCopy } from "@/lib/i18n/cart-copy";
import type { ConsentCopy } from "@/lib/i18n/consent-copy";
import { cleanOverride, interpolate, pickOverrides, pluralTemplate } from "@/lib/i18n/merge-copy";
import {
  ACCOUNT_ERROR_FIELDS,
  ACCOUNT_FIELDS,
  ACCOUNT_TEMPLATE_FIELDS,
  CART_FIELDS,
  CART_LINK_FIELDS,
  CONSENT_FIELDS,
  type UiStringsRecord,
} from "@/lib/i18n/ui-strings-fields";

/**
 * Overlay `ui_string` (one locale) on the built-in copy. Empty or missing CMS fields keep the
 * code text, so a CMS outage or an unmigrated environment never blanks the UI.
 */

export function resolveConsentCopy(base: ConsentCopy, record: UiStringsRecord | null | undefined): ConsentCopy {
  return { ...base, ...pickOverrides(CONSENT_FIELDS, record) };
}

export function resolveCartCopy(base: CartCopy, record: UiStringsRecord | null | undefined): CartCopy {
  const one = cleanOverride(record?.[CART_LINK_FIELDS.one]);
  const other = cleanOverride(record?.[CART_LINK_FIELDS.other]);
  return {
    ...base,
    ...pickOverrides(CART_FIELDS, record),
    // Singular and plural must come together; one alone would print e.g. "1 items".
    linkLabel: one && other ? (count) => pluralTemplate(one, other, count) : base.linkLabel,
  };
}

export function resolveAccountCopy(base: AccountCopy, record: UiStringsRecord | null | undefined): AccountCopy {
  const greeting = cleanOverride(record?.[ACCOUNT_TEMPLATE_FIELDS.greeting]);
  const greetingAnonymous = cleanOverride(record?.[ACCOUNT_TEMPLATE_FIELDS.greetingAnonymous]);
  const linkSignedIn = cleanOverride(record?.[ACCOUNT_TEMPLATE_FIELDS.linkSignedIn]);
  const linkSignedOut = cleanOverride(record?.[ACCOUNT_TEMPLATE_FIELDS.linkSignedOut]);
  return {
    ...base,
    ...pickOverrides(ACCOUNT_FIELDS, record),
    errors: { ...base.errors, ...pickOverrides(ACCOUNT_ERROR_FIELDS, record) },
    greeting: (name) => {
      if (name) return greeting ? interpolate(greeting, { name }) : base.greeting(name);
      return greetingAnonymous ?? base.greeting(null);
    },
    linkLabel: (signedIn) => (signedIn ? linkSignedIn : linkSignedOut) ?? base.linkLabel(signedIn),
  };
}
