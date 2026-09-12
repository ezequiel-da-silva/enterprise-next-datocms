import type { AppLocale } from "@/constants/i18n";
import { toDatoSiteLocale } from "@/constants/i18n";
import { datocmsFetch, type DatocmsResponse } from "@/infra/datocms/client";
import type { GetContactPageQuery } from "@/infra/datocms/generated/operations.types";
import { GET_CONTACT_PAGE } from "@/infra/datocms/queries";
import { cmsPageCanonicalPath } from "@/lib/datocms/cms-page-path";
import { cache } from "react";
import { stripStega } from "react-datocms/stega";

export type ContactPageReference = NonNullable<
  NonNullable<GetContactPageQuery["globalSetting"]>["contactPage"]
>;

/** Slugs históricos / localizados da página de contacto. */
export const CONTACT_PAGE_ALIAS_SLUGS = new Set(["contato", "contact", "contacto"]);

const loadContactPage = cache(
  async (
    locale: AppLocale,
    includeDrafts: boolean,
  ): Promise<DatocmsResponse<GetContactPageQuery>> => {
    const devPublishedNoStore = process.env.NODE_ENV === "development" && !includeDrafts;

    return datocmsFetch<GetContactPageQuery>({
      query: GET_CONTACT_PAGE,
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
export async function getContactPage(
  locale: AppLocale,
  includeDrafts: boolean,
): Promise<ContactPageReference | null> {
  const result = await loadContactPage(locale, includeDrafts);
  if ("errors" in result) return null;
  return result.data.globalSetting?.contactPage ?? null;
}

export function contactPagePath(
  locale: AppLocale,
  page: ContactPageReference | null | undefined,
): string {
  const slug = page?.slug?.trim();
  return slug ? cmsPageCanonicalPath(slug, locale) : `/${locale}/contato`;
}

export function contactPageLabel(page: ContactPageReference | null | undefined): string {
  const title = page?.title;
  return title && stripStega(title).trim() ? title : "Contato";
}

export function isContactPageAliasSlug(slug: string): boolean {
  return CONTACT_PAGE_ALIAS_SLUGS.has(slug.toLowerCase());
}
