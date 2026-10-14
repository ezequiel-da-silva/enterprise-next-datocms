import { UI_STRINGS_FIELD_NAMES } from "@/lib/i18n/ui-strings-fields";

/**
 * Singleton `ui_strings` for ONE locale.
 *
 * No `fallbackLocales` on purpose: an empty `pt_BR` field must come back `null` so the code
 * default (Portuguese) wins, instead of silently showing the English text.
 * The selection is generated from `UI_STRINGS_FIELD_NAMES`, so query and field map cannot drift.
 */
export const GET_UI_STRINGS = /* GraphQL */ `
  query GetUiStrings($locale: SiteLocale!) {
    uiStrings(locale: $locale) {
      ${UI_STRINGS_FIELD_NAMES.join("\n      ")}
    }
  }
`;
