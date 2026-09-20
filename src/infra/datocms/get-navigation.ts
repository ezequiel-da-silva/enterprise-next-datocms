import type { AppLocale } from "@/constants/i18n";
import { getLayoutChrome, sliceChromeNavigation } from "@/infra/datocms/get-layout-chrome";
import type { DatocmsResponse } from "@/infra/datocms/client";
import type { GetNavigationQueryResult, NavigationData } from "@/infra/datocms/types-navigation";
import { DATOCMS_CACHE_TAGS } from "@/lib/datocms/revalidate-tags";

const NAV_TAG = DATOCMS_CACHE_TAGS.navigation;

export function getNavigation(
  locale: AppLocale,
  includeDrafts: boolean,
): Promise<DatocmsResponse<GetNavigationQueryResult>> {
  return getLayoutChrome(locale, includeDrafts).then(sliceChromeNavigation);
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
