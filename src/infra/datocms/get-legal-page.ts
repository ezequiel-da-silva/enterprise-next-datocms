import type { AppLocale } from "@/constants/i18n";
import { toDatoSiteLocale } from "@/constants/i18n";
import { cdaFetchCache } from "@/infra/datocms/cda-fetch-cache";
import { datocmsFetch, type DatocmsResponse } from "@/infra/datocms/client";
import type { LegalPageBySlugQuery } from "@/infra/datocms/generated/operations.types";
import { LEGAL_PAGE_BY_SLUG } from "@/infra/datocms/queries";
import type { LegalPageRecord } from "@/infra/datocms/types-legal";
import { cmsPageCanonicalPath } from "@/lib/datocms/cms-page-path";
import { cache } from "react";

export type { LegalPageRecord };

function asLegalPageRecord(
  page: LegalPageBySlugQuery["legalPage"] | null | undefined,
): LegalPageRecord | null {
  const slug = page?.slug?.trim();
  if (!page || !slug) return null;
  const title = page.title?.trim() || slug;
  return { ...page, slug, title };
}

const loadLegalPageBySlug = cache(
  async (
    slug: string,
    includeDrafts: boolean,
    locale: AppLocale,
  ): Promise<DatocmsResponse<LegalPageBySlugQuery>> => {
    return datocmsFetch<LegalPageBySlugQuery>({
      query: LEGAL_PAGE_BY_SLUG,
      variables: { slug, locale: toDatoSiteLocale(locale) },
      includeDrafts,
      ...cdaFetchCache({
        includeDrafts,
        tags: ["datocms:legal", `legal:${locale}:${slug}`],
        revalidate: 120,
        bypassPublishedCacheInDev: true,
      }),
    });
  },
);

export async function getLegalPageBySlug(
  slug: string,
  includeDrafts: boolean,
  locale: AppLocale,
): Promise<LegalPageRecord | null> {
  const result = await loadLegalPageBySlug(slug, includeDrafts, locale);
  if ("errors" in result) return null;
  return asLegalPageRecord(result.data.legalPage);
}

export async function getLegalPageBySlugResult(
  slug: string,
  includeDrafts: boolean,
  locale: AppLocale,
): Promise<{ page: LegalPageRecord; faviconMetaTags: LegalPageBySlugQuery["_site"]["faviconMetaTags"] } | null> {
  const result = await loadLegalPageBySlug(slug, includeDrafts, locale);
  if ("errors" in result) return null;
  const page = asLegalPageRecord(result.data.legalPage);
  if (!page) return null;
  return { page, faviconMetaTags: result.data._site.faviconMetaTags };
}

export function legalPagePath(slug: string, locale: AppLocale): string {
  return cmsPageCanonicalPath(slug, locale);
}
