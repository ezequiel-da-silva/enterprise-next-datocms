import type { AppLocale } from "@/constants/i18n";
import { toDatoSiteLocale } from "@/constants/i18n";
import { datocmsFetch, type DatocmsResponse } from "@/infra/datocms/client";
import type { PageBySlugQuery } from "@/infra/datocms/generated/operations.types";
import { PAGE_BY_SLUG } from "@/infra/datocms/queries";
import { normalizePageBySlugResult, type PageBySlugQueryResult } from "@/infra/datocms/types-page";
import { cache } from "react";

const loadPageBySlug = cache(
  async (
    slug: string,
    includeDrafts: boolean,
    locale: AppLocale,
  ): Promise<DatocmsResponse<PageBySlugQueryResult>> => {
    const baseEditingUrl = process.env.NEXT_PUBLIC_DATOCMS_BASE_EDITING_URL;
    /** Em dev evita cache de `page: null` após publicares no Dato (fetch com tags ainda guardava 404). */
    const devPublishedNoStore = process.env.NODE_ENV === "development" && !includeDrafts;

    const withEditingUrl = Boolean(includeDrafts && baseEditingUrl);

    const response = await datocmsFetch<PageBySlugQuery>({
      query: PAGE_BY_SLUG,
      variables: { slug, locale: toDatoSiteLocale(locale), withEditingUrl },
      tags: includeDrafts || devPublishedNoStore ? undefined : ["datocms:page", `page:${locale}:${slug}`],
      revalidate: includeDrafts || devPublishedNoStore ? false : 120,
      includeDrafts,
      contentLink: includeDrafts && baseEditingUrl ? "v1" : undefined,
      baseEditingUrl: includeDrafts && baseEditingUrl ? baseEditingUrl : undefined,
      cache: includeDrafts || devPublishedNoStore ? "no-store" : undefined,
    });

    if ("errors" in response) {
      return response;
    }

    return { data: normalizePageBySlugResult(response.data) };
  },
);

/**
 * Fetch de página via infra — `includeDrafts` deve refletir `draftMode().isEnabled` na rota.
 */
export function getPageBySlug(
  slug: string,
  includeDrafts: boolean,
  locale: AppLocale,
): Promise<DatocmsResponse<PageBySlugQueryResult>> {
  return loadPageBySlug(slug, includeDrafts, locale);
}
