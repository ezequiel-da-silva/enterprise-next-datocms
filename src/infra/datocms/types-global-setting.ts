import type { CdaStructuredTextValue } from "datocms-structured-text-utils";
import type { FileFieldLike } from "@/infra/datocms/types-page";

export type GlobalSetting404Image = {
  id: string;
  asset?: FileFieldLike;
  assetDesktop?: FileFieldLike;
} | null;

export type GlobalSettingPageRef = {
  id: string;
  title?: string | null;
  slug?: string | null;
} | null;

export type GlobalSettingRecord = {
  title404?: string | null;
  description404: CdaStructuredTextValue | null;
  image404: GlobalSetting404Image;
  blogPage?: GlobalSettingPageRef;
  contactPage?: GlobalSettingPageRef;
  searchPage?: GlobalSettingPageRef;
  productsPage?: GlobalSettingPageRef;
  collectionsPage?: GlobalSettingPageRef;
};

export type GetGlobalSettingsQueryResult = {
  globalSetting: GlobalSettingRecord | null;
};
