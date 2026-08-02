import type { AppLocale } from "@/constants/i18n";
import { toDatoSiteLocale } from "@/constants/i18n";
import { datocmsFetch, type DatocmsResponse } from "@/infra/datocms/client";
import { GET_NAVIGATION } from "@/infra/datocms/navigation-query";
import type { GetNavigationQueryResult, NavigationData } from "@/infra/datocms/types-navigation";
import { cache } from "react";

const NAV_TAG = "datocms:navigation";

const loadNavigation = cache(
  async (locale: AppLocale, includeDrafts: boolean): Promise<DatocmsResponse<GetNavigationQueryResult>> => {
    const baseEditingUrl = process.env.NEXT_PUBLIC_DATOCMS_BASE_EDITING_URL;
    const devPublishedNoStore = process.env.NODE_ENV === "development" && !includeDrafts;

    return datocmsFetch<GetNavigationQueryResult>({
      query: GET_NAVIGATION,
      variables: { locale: toDatoSiteLocale(locale) },
      tags: includeDrafts || devPublishedNoStore ? undefined : [NAV_TAG, `navigation:${locale}`],
      revalidate: includeDrafts || devPublishedNoStore ? false : 300,
      includeDrafts,
      contentLink: includeDrafts && baseEditingUrl ? "v1" : undefined,
      baseEditingUrl: includeDrafts && baseEditingUrl ? baseEditingUrl : undefined,
      cache: includeDrafts || devPublishedNoStore ? "no-store" : undefined,
    });
  },
);

export function getNavigation(
  locale: AppLocale,
  includeDrafts: boolean,
): Promise<DatocmsResponse<GetNavigationQueryResult>> {
  return loadNavigation(locale, includeDrafts);
}

export function navigationRevalidateTags(locale?: AppLocale): string[] {
  return locale ? [NAV_TAG, `navigation:${locale}`] : [NAV_TAG];
}

/** Dados úteis para Header/Footer; `null` se o registo não existir ou erro. */
export function pickNavigationData(
  result: DatocmsResponse<GetNavigationQueryResult>,
): NavigationData | null {
  if ("errors" in result) {
    return null;
  }
  return result.data.navigation;
}
