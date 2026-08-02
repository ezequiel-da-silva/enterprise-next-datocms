import type { CdaStructuredTextValue } from "datocms-structured-text-utils";
import type { FileFieldLike } from "@/infra/datocms/types-page";

export type NavItemRecord = {
  __typename: "NavItemModularRecord" | "NavItemSimpleRecord";
  id: string;
  navItemLabel: string;
  navItemLink: string;
  navItemLinkAria: string;
  openInNewTab: boolean;
  submenu?: NavItemRecord[] | null;
};

export type SocialLinkNav = {
  id: string;
  plataforma: string | null;
  url: string | null;
  linkAria: string | null;
  openInNewTab: boolean | null;
  image: FileFieldLike;
};

export type NavigationData = {
  logo: FileFieldLike | null;
  menuLinks: NavItemRecord[];
  showThemeToggle: boolean;
  footerLogo: FileFieldLike | null;
  footerMenu: NavItemRecord[];
  socialLinks: SocialLinkNav[];
  copyrightText: Pick<CdaStructuredTextValue, "value" | "blocks" | "links" | "inlineBlocks"> | null;
  legalLinks: NavItemRecord[];
};

export type GetNavigationQueryResult = {
  navigation: NavigationData | null;
};
