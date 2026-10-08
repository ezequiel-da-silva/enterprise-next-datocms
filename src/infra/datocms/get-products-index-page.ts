import type { AppLocale } from "@/constants/i18n";
import { getGlobalSettings, pickGlobalSetting } from "@/infra/datocms/get-global-settings";
import type { GlobalSettingPageRef } from "@/infra/datocms/types-global-setting";
import { cmsPageCanonicalPath } from "@/lib/datocms/cms-page-path";
import { stripStega } from "react-datocms/stega";

export type ProductsIndexPageReference = NonNullable<GlobalSettingPageRef>;

export async function getProductsIndexPage(
  locale: AppLocale,
  includeDrafts: boolean,
): Promise<ProductsIndexPageReference | null> {
  const setting = pickGlobalSetting(await getGlobalSettings(locale, includeDrafts));
  return setting?.productsPage ?? null;
}

export function productsIndexPath(
  locale: AppLocale,
  page: ProductsIndexPageReference | null | undefined,
): string {
  const slug = page?.slug?.trim();
  return slug ? cmsPageCanonicalPath(slug, locale) : `/${locale}/products`;
}

export function productsIndexLabel(page: ProductsIndexPageReference | null | undefined): string {
  const title = page?.title;
  return title && stripStega(title).trim() ? title : "Products";
}

export { productPagePath } from "@/lib/datocms/product-page-path";
