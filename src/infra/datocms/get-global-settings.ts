import type { AppLocale } from "@/constants/i18n";
import { toDatoSiteLocale } from "@/constants/i18n";
import { datocmsFetch, type DatocmsResponse } from "@/infra/datocms/client";
import { GET_GLOBAL_SETTINGS } from "@/infra/datocms/queries";
import type { GetGlobalSettingsQueryResult, GlobalSettingRecord } from "@/infra/datocms/types-global-setting";
import { cache } from "react";

const GLOBAL_SETTINGS_TAG = "datocms:global-settings";

const loadGlobalSettings = cache(
  async (
    locale: AppLocale,
    includeDrafts: boolean,
  ): Promise<DatocmsResponse<GetGlobalSettingsQueryResult>> => {
    const baseEditingUrl = process.env.NEXT_PUBLIC_DATOCMS_BASE_EDITING_URL;
    const devPublishedNoStore = process.env.NODE_ENV === "development" && !includeDrafts;

    return datocmsFetch<GetGlobalSettingsQueryResult>({
      query: GET_GLOBAL_SETTINGS,
      variables: { locale: toDatoSiteLocale(locale) },
      tags: includeDrafts || devPublishedNoStore ? undefined : [GLOBAL_SETTINGS_TAG, `global-settings:${locale}`],
      revalidate: includeDrafts || devPublishedNoStore ? false : 300,
      includeDrafts,
      contentLink: includeDrafts && baseEditingUrl ? "v1" : undefined,
      baseEditingUrl: includeDrafts && baseEditingUrl ? baseEditingUrl : undefined,
      cache: includeDrafts || devPublishedNoStore ? "no-store" : undefined,
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
