import type { AppLocale } from "@/constants/i18n";
import { getGlobalSettings, pickGlobalSetting } from "@/infra/datocms/get-global-settings";
import type { GlobalSettingPageRef } from "@/infra/datocms/types-global-setting";
import { cmsPageCanonicalPath } from "@/lib/datocms/cms-page-path";
import { stripStega } from "react-datocms/stega";

export type CollectionsIndexPageReference = NonNullable<GlobalSettingPageRef>;

export async function getCollectionsIndexPage(
  locale: AppLocale,
  includeDrafts: boolean,
): Promise<CollectionsIndexPageReference | null> {
  const setting = pickGlobalSetting(await getGlobalSettings(locale, includeDrafts));
  return setting?.collectionsPage ?? null;
}

export function collectionsIndexPath(
  locale: AppLocale,
  page: CollectionsIndexPageReference | null | undefined,
): string {
  const slug = page?.slug?.trim();
  return slug ? cmsPageCanonicalPath(slug, locale) : `/${locale}/collections`;
}

export function collectionsIndexLabel(page: CollectionsIndexPageReference | null | undefined): string {
  const title = page?.title;
  return title && stripStega(title).trim() ? title : "Collections";
}
