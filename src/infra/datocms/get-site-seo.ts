import type { AppLocale } from "@/constants/i18n";
import { toDatoSiteLocale } from "@/constants/i18n";
import { datocmsFetch, type DatocmsResponse } from "@/infra/datocms/client";
import { GET_SITE_SEO } from "@/infra/datocms/queries";
import type { GetSiteSeoQueryResult, SiteGlobalSeo } from "@/infra/datocms/types-site-seo";
import { cache } from "react";

const SITE_SEO_TAG = "datocms:site-seo";

const loadSiteSeo = cache(
  async (
    locale: AppLocale,
    includeDrafts: boolean,
  ): Promise<DatocmsResponse<GetSiteSeoQueryResult>> => {
    const baseEditingUrl = process.env.NEXT_PUBLIC_DATOCMS_BASE_EDITING_URL;
    const devPublishedNoStore = process.env.NODE_ENV === "development" && !includeDrafts;

    return datocmsFetch<GetSiteSeoQueryResult>({
      query: GET_SITE_SEO,
      variables: { locale: toDatoSiteLocale(locale) },
      tags: includeDrafts || devPublishedNoStore ? undefined : [SITE_SEO_TAG, `site-seo:${locale}`],
      revalidate: includeDrafts || devPublishedNoStore ? false : 300,
      includeDrafts,
      contentLink: includeDrafts && baseEditingUrl ? "v1" : undefined,
      baseEditingUrl: includeDrafts && baseEditingUrl ? baseEditingUrl : undefined,
      cache: includeDrafts || devPublishedNoStore ? "no-store" : undefined,
    });
  },
);

export function getSiteSeo(
  locale: AppLocale,
  includeDrafts: boolean,
): Promise<DatocmsResponse<GetSiteSeoQueryResult>> {
  return loadSiteSeo(locale, includeDrafts);
}

export function pickSiteSeo(result: DatocmsResponse<GetSiteSeoQueryResult>): SiteGlobalSeo | null {
  if ("errors" in result) {
    return null;
  }
  return result.data._site.globalSeo ?? null;
}

export function siteSeoRevalidateTags(locale?: AppLocale): string[] {
  return locale ? [SITE_SEO_TAG, `site-seo:${locale}`] : [SITE_SEO_TAG];
}
