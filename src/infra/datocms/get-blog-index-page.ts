import type { AppLocale } from "@/constants/i18n";
import { toDatoSiteLocale } from "@/constants/i18n";
import { datocmsFetch, type DatocmsResponse } from "@/infra/datocms/client";
import type { GetBlogIndexPageQuery } from "@/infra/datocms/generated/operations.types";
import { GET_BLOG_INDEX_PAGE } from "@/infra/datocms/queries";
import { cmsPageCanonicalPath } from "@/lib/datocms/cms-page-path";
import { cache } from "react";
import { stripStega } from "react-datocms/stega";

export type BlogIndexPageReference = NonNullable<
  NonNullable<GetBlogIndexPageQuery["globalSetting"]>["blogPage"]
>;

const loadBlogIndexPage = cache(
  async (
    locale: AppLocale,
    includeDrafts: boolean,
  ): Promise<DatocmsResponse<GetBlogIndexPageQuery>> => {
    const devPublishedNoStore = process.env.NODE_ENV === "development" && !includeDrafts;

    return datocmsFetch<GetBlogIndexPageQuery>({
      query: GET_BLOG_INDEX_PAGE,
      variables: { locale: toDatoSiteLocale(locale) },
      tags:
        includeDrafts || devPublishedNoStore
          ? undefined
          : ["datocms:global-settings", `global-settings:${locale}`, "datocms:page"],
      revalidate: includeDrafts || devPublishedNoStore ? false : 300,
      includeDrafts,
      cache: includeDrafts || devPublishedNoStore ? "no-store" : undefined,
    });
  },
);

/**
 * A referência é opcional durante a implantação da migration. Enquanto o campo
 * ainda não existir (ou não estiver preenchido), mantém o caminho histórico.
 */
export async function getBlogIndexPage(
  locale: AppLocale,
  includeDrafts: boolean,
): Promise<BlogIndexPageReference | null> {
  const result = await loadBlogIndexPage(locale, includeDrafts);
  if ("errors" in result) return null;
  return result.data.globalSetting?.blogPage ?? null;
}

export function blogIndexPath(
  locale: AppLocale,
  page: BlogIndexPageReference | null | undefined,
): string {
  const slug = page?.slug?.trim();
  return slug ? cmsPageCanonicalPath(slug, locale) : `/${locale}/blog`;
}

export function blogIndexLabel(page: BlogIndexPageReference | null | undefined): string {
  const title = page?.title;
  return title && stripStega(title).trim() ? title : "Blog";
}
