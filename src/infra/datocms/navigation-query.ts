/** Profundidade máxima de submenu (apenas `NavItemModularRecord` aninhados). */
const NAV_SUBMENU_DEPTH = 6;

function navSubmenuModularOnly(depth: number): string {
  if (depth <= 0) return "";
  return `
    submenu {
      __typename
      ... on NavItemModularRecord {
        id
        navItemLabel
        navItemLink
        navItemLinkAria
        openInNewTab
        ${navSubmenuModularOnly(depth - 1)}
      }
    }
  `;
}

const NAV_LINK_FIELDS = `
  __typename
  id
  ctaLabel
  typeContent
  externalLink
  openInNewTab
  ctaLinkAria
  internalLinkPage {
    __typename
    slug
  }
  internalLinkPost {
    __typename
    postSlug
  }
  internalLinkCategory {
    __typename
    categorySlug
  }
  internalLinkAuthor {
    __typename
    authorSlug
  }
  internalLinkProduct {
    __typename
    shopifyHandle
    title
  }
  internalLinkCollection {
    __typename
    shopifyHandle
    title
  }
`;

/** Header `menu_links`: classic modular items + mega-menu panels. */
const NAV_MENU_ROOT = `
  __typename
  ... on NavItemModularRecord {
    id
    navItemLabel
    navItemLink
    navItemLinkAria
    openInNewTab
    ${navSubmenuModularOnly(NAV_SUBMENU_DEPTH)}
  }
  ... on NavigationMegaMenuRecord {
    id
    label
    categories {
      __typename
      ... on NavMegaMenuCategoryRecord {
        id
        title
        links {
          ${NAV_LINK_FIELDS}
        }
      }
    }
    campaign {
      __typename
      ... on NavMegaMenuCampaignRecord {
        id
        title
        description
        cta {
          ${NAV_LINK_FIELDS}
        }
        image {
          url
          alt
          width
          height
          blurUpThumb
        }
      }
    }
  }
`;

/** Footer keeps classic modular items only (mega panels flatten poorly). */
const NAV_FOOTER_ROOT = `
  __typename
  ... on NavItemModularRecord {
    id
    navItemLabel
    navItemLink
    navItemLinkAria
    openInNewTab
    ${navSubmenuModularOnly(NAV_SUBMENU_DEPTH)}
  }
`;

/** `legal_links` só aceita bloco simple no topo. */
const NAV_LEGAL_ROOT = `
  __typename
  ... on NavItemSimpleRecord {
    id
    navItemLabel
    navItemLink
    navItemLinkAria
    openInNewTab
    ${navSubmenuModularOnly(NAV_SUBMENU_DEPTH)}
  }
`;

const FILE_FIELD = `
  url
  alt
  width
  height
  blurUpThumb
`;

export const NAVIGATION_SELECTION = `
      logo {
        ${FILE_FIELD}
      }
      menuLinks {
        ${NAV_MENU_ROOT}
      }
      showThemeToggle
      showHeaderSearch
      headerSearchPlaceholder
      headerSearchSubmitLabel
      footerLogo {
        ${FILE_FIELD}
      }
      footerMenu {
        ${NAV_FOOTER_ROOT}
      }
      socialLinks {
        id
        plataforma
        url
        linkAria
        openInNewTab
        image {
          ${FILE_FIELD}
        }
      }
      copyrightText {
        value
        blocks
        links
        inlineBlocks
      }
      legalLinks {
        ${NAV_LEGAL_ROOT}
      }
`;

/**
 * Single Instance `navigation` com fieldsets Header + Footer.
 * `fallbackLocales`: quando o locale da URL não tem tradução, o Dato preenche a partir de outro idioma.
 */
export const GET_NAVIGATION = /* GraphQL */ `
  query GetNavigation($locale: SiteLocale!) {
    navigation(locale: $locale, fallbackLocales: [en, pt_BR, es]) {
      ${NAVIGATION_SELECTION}
    }
  }
`;
