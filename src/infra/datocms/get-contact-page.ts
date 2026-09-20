import type { AppLocale } from "@/constants/i18n";
import { getGlobalSettings, pickGlobalSetting } from "@/infra/datocms/get-global-settings";
import type { GlobalSettingPageRef } from "@/infra/datocms/types-global-setting";
import { cmsPageCanonicalPath } from "@/lib/datocms/cms-page-path";
import { stripStega } from "react-datocms/stega";

export type ContactPageReference = NonNullable<GlobalSettingPageRef>;

/** Slugs históricos / localizados da página de contacto. */
export const CONTACT_PAGE_ALIAS_SLUGS = new Set(["contato", "contact", "contacto"]);

/**
 * A referência é opcional durante a implantação da migration. Enquanto o campo
 * ainda não existir (ou não estiver preenchido), mantém o caminho histórico.
 */
export async function getContactPage(
  locale: AppLocale,
  includeDrafts: boolean,
): Promise<ContactPageReference | null> {
  const setting = pickGlobalSetting(await getGlobalSettings(locale, includeDrafts));
  return setting?.contactPage ?? null;
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
