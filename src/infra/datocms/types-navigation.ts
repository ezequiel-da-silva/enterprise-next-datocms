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

/** Link block nested in mega-menu categories / campaign CTA (CDA camelCase). */
export type NavMegaMenuLinkRecord = {
  __typename: "LinkRecord";
  id: string;
  ctaLabel: string | null;
  typeContent: string | null;
  externalLink: string | null;
  openInNewTab: boolean;
  ctaLinkAria: string | null;
  internalLinkPage: { __typename: string; slug: string | null } | null;
  internalLinkPost: { __typename: string; postSlug: string | null } | null;
  internalLinkCategory: { __typename: string; categorySlug: string | null } | null;
  internalLinkAuthor: { __typename: string; authorSlug: string | null } | null;
  internalLinkProduct: { __typename: string; shopifyHandle: string | null; title: string | null } | null;
  internalLinkCollection: { __typename: string; shopifyHandle: string | null; title: string | null } | null;
};

export type NavMegaMenuCategoryRecord = {
  __typename: "NavMegaMenuCategoryRecord";
  id: string;
  title: string | null;
  links: NavMegaMenuLinkRecord[];
};

export type NavMegaMenuCampaignRecord = {
  __typename: "NavMegaMenuCampaignRecord";
  id: string;
  title: string | null;
  description: string | null;
  cta: NavMegaMenuLinkRecord[];
  image: FileFieldLike;
};

export type NavigationMegaMenuRecord = {
  __typename: "NavigationMegaMenuRecord";
  id: string;
  label: string | null;
  categories: NavMegaMenuCategoryRecord[];
  campaign: NavMegaMenuCampaignRecord[];
};

/** Top-level header menu entry: classic flyout or mega-menu panel. */
export type HeaderMenuItem = NavItemRecord | NavigationMegaMenuRecord;

export function isNavigationMegaMenu(item: HeaderMenuItem): item is NavigationMegaMenuRecord {
  return item.__typename === "NavigationMegaMenuRecord";
}

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
  menuLinks: HeaderMenuItem[];
  showThemeToggle: boolean;
  showHeaderSearch?: boolean | null;
  headerSearchPlaceholder?: string | null;
  headerSearchSubmitLabel?: string | null;
  footerLogo: FileFieldLike | null;
  footerMenu: NavItemRecord[];
  socialLinks: SocialLinkNav[];
  copyrightText: Pick<CdaStructuredTextValue, "value" | "blocks" | "links" | "inlineBlocks"> | null;
  legalLinks: NavItemRecord[];
};

export type GetNavigationQueryResult = {
  navigation: NavigationData | null;
};
