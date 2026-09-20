import type { AppLocale } from "@/constants/i18n";
import { toDatoSiteLocale } from "@/constants/i18n";
import { cdaFetchCache } from "@/infra/datocms/cda-fetch-cache";
import { datocmsFetch, type DatocmsResponse } from "@/infra/datocms/client";
import { GET_LAYOUT_CHROME } from "@/infra/datocms/layout-chrome-query";
import { DATOCMS_CACHE_TAGS } from "@/lib/datocms/revalidate-tags";
import type { GetNavigationQueryResult } from "@/infra/datocms/types-navigation";
import type { GetSiteSeoQueryResult } from "@/infra/datocms/types-site-seo";
import { cache } from "react";

export type LayoutChromeQueryResult = GetNavigationQueryResult & GetSiteSeoQueryResult;

function chromeTags(locale: AppLocale): string[] {
  return [
    DATOCMS_CACHE_TAGS.navigation,
    `navigation:${locale}`,
    DATOCMS_CACHE_TAGS.siteSeo,
    `site-seo:${locale}`,
  ];
}

const loadLayoutChrome = cache(
  async (
    locale: AppLocale,
    includeDrafts: boolean,
  ): Promise<DatocmsResponse<LayoutChromeQueryResult>> => {
    const baseEditingUrl = process.env.NEXT_PUBLIC_DATOCMS_BASE_EDITING_URL;
    return datocmsFetch<LayoutChromeQueryResult>({
      query: GET_LAYOUT_CHROME,
      variables: { locale: toDatoSiteLocale(locale) },
      includeDrafts,
      contentLink: includeDrafts && baseEditingUrl ? "v1" : undefined,
      baseEditingUrl: includeDrafts && baseEditingUrl ? baseEditingUrl : undefined,
      ...cdaFetchCache({
        includeDrafts,
        tags: chromeTags(locale),
        revalidate: 300,
      }),
    });
  },
);

export function getLayoutChrome(
  locale: AppLocale,
  includeDrafts: boolean,
): Promise<DatocmsResponse<LayoutChromeQueryResult>> {
  return loadLayoutChrome(locale, includeDrafts);
}

export function sliceChromeNavigation(
  result: DatocmsResponse<LayoutChromeQueryResult>,
): DatocmsResponse<GetNavigationQueryResult> {
  if ("errors" in result) return result;
  return { data: { navigation: result.data.navigation } };
}

export function sliceChromeSiteSeo(
  result: DatocmsResponse<LayoutChromeQueryResult>,
): DatocmsResponse<GetSiteSeoQueryResult> {
  if ("errors" in result) return result;
  return { data: { _site: result.data._site } };
}
