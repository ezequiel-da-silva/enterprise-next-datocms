import type { AppLocale } from "@/constants/i18n";
import { toDatoSiteLocale } from "@/constants/i18n";
import { cdaFetchCache } from "@/infra/datocms/cda-fetch-cache";
import { datocmsFetch, type DatocmsResponse } from "@/infra/datocms/client";
import { GET_GLOBAL_SETTINGS } from "@/infra/datocms/queries";
import type { GetGlobalSettingsQueryResult, GlobalSettingRecord } from "@/infra/datocms/types-global-setting";
import { DATOCMS_CACHE_TAGS } from "@/lib/datocms/revalidate-tags";
import { cache } from "react";

const GLOBAL_SETTINGS_TAG = DATOCMS_CACHE_TAGS.globalSettings;

const loadGlobalSettings = cache(
  async (
    locale: AppLocale,
    includeDrafts: boolean,
  ): Promise<DatocmsResponse<GetGlobalSettingsQueryResult>> => {
    const baseEditingUrl = process.env.NEXT_PUBLIC_DATOCMS_BASE_EDITING_URL;
    return datocmsFetch<GetGlobalSettingsQueryResult>({
      query: GET_GLOBAL_SETTINGS,
      variables: { locale: toDatoSiteLocale(locale) },
      includeDrafts,
      contentLink: includeDrafts && baseEditingUrl ? "v1" : undefined,
      baseEditingUrl: includeDrafts && baseEditingUrl ? baseEditingUrl : undefined,
      ...cdaFetchCache({
        includeDrafts,
        tags: [GLOBAL_SETTINGS_TAG, `global-settings:${locale}`, DATOCMS_CACHE_TAGS.page],
        revalidate: 300,
      }),
    });
  },
);

export function getGlobalSettings(
  locale: AppLocale,
  includeDrafts: boolean,
): Promise<DatocmsResponse<GetGlobalSettingsQueryResult>> {
  return loadGlobalSettings(locale, includeDrafts);
}

export function pickGlobalSetting(
  result: DatocmsResponse<GetGlobalSettingsQueryResult>,
): GlobalSettingRecord | null {
  if ("errors" in result) {
    return null;
  }
  return result.data.globalSetting;
}

export function globalSettingsRevalidateTags(locale?: AppLocale): string[] {
  return locale ? [GLOBAL_SETTINGS_TAG, `global-settings:${locale}`] : [GLOBAL_SETTINGS_TAG];
}
