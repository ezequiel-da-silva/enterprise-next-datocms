import type { AppLocale } from "@/constants/i18n";
import { getLayoutChrome, sliceChromeSiteSeo } from "@/infra/datocms/get-layout-chrome";
import type { DatocmsResponse } from "@/infra/datocms/client";
import type { GetSiteSeoQueryResult, SiteGlobalSeo } from "@/infra/datocms/types-site-seo";
import { DATOCMS_CACHE_TAGS } from "@/lib/datocms/revalidate-tags";

const SITE_SEO_TAG = DATOCMS_CACHE_TAGS.siteSeo;

export function getSiteSeo(
  locale: AppLocale,
  includeDrafts: boolean,
): Promise<DatocmsResponse<GetSiteSeoQueryResult>> {
  return getLayoutChrome(locale, includeDrafts).then(sliceChromeSiteSeo);
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
