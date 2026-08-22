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

/** `menu_links` e `footer_menu` no schema só aceitam blocos modular no topo. */
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

/**
 * Single Instance `navigation` com fieldsets Header + Footer.
 * `fallbackLocales`: quando o locale da URL não tem tradução, o Dato preenche a partir de outro idioma.
 */
export const GET_NAVIGATION = /* GraphQL */ `
  query GetNavigation($locale: SiteLocale!) {
    navigation(locale: $locale, fallbackLocales: [en, pt_BR, es]) {
      logo {
        ${FILE_FIELD}
      }
      menuLinks {
        ${NAV_MENU_ROOT}
      }
      showThemeToggle
      footerLogo {
        ${FILE_FIELD}
      }
      footerMenu {
        ${NAV_MENU_ROOT}
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
    }
  }
`;
