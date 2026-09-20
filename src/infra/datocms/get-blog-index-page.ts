import type { AppLocale } from "@/constants/i18n";
import { getGlobalSettings, pickGlobalSetting } from "@/infra/datocms/get-global-settings";
import type { GlobalSettingPageRef } from "@/infra/datocms/types-global-setting";
import { cmsPageCanonicalPath } from "@/lib/datocms/cms-page-path";
import { stripStega } from "react-datocms/stega";

export type BlogIndexPageReference = NonNullable<GlobalSettingPageRef>;

export async function getBlogIndexPage(
  locale: AppLocale,
  includeDrafts: boolean,
): Promise<BlogIndexPageReference | null> {
  const setting = pickGlobalSetting(await getGlobalSettings(locale, includeDrafts));
  return setting?.blogPage ?? null;
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
