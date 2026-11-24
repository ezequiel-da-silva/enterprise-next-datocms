import {
  isNavigationMegaMenu,
  type HeaderMenuItem,
  type NavItemRecord,
} from "@/infra/datocms/types-navigation";

const COMMERCE_LABEL =
  /\b(shop|loja|tienda|collections?|colec(?:[aã]o|ões|iones?)|best\s*of|melhores|destaques?|destacados|mais\s*vendidos)\b/i;
const COMMERCE_PATH =
  /\/(shop|loja|tienda|collections?|colec(?:oes|iones)|best|melhores|lo-mejor)(\/|$)/i;

function isCommerceModular(item: NavItemRecord): boolean {
  if (COMMERCE_LABEL.test(item.navItemLabel)) return true;
  return COMMERCE_PATH.test(item.navItemLink);
}

function isCommerceMenuItem(item: HeaderMenuItem): boolean {
  if (isNavigationMegaMenu(item)) {
    const label = item.label?.trim() ?? "";
    if (COMMERCE_LABEL.test(label)) return true;
    return true; // mega-menu is a commerce discovery surface
  }
  return isCommerceModular(item);
}

/**
 * Stable partition: commerce links first (Shop / Collections / Best of / mega), then the rest.
 * Relative order within each group is preserved.
 */
export function prioritizeCommerceNavLinks(items: readonly HeaderMenuItem[]): HeaderMenuItem[] {
  const commerce: HeaderMenuItem[] = [];
  const rest: HeaderMenuItem[] = [];
  for (const item of items) {
    if (isCommerceMenuItem(item)) commerce.push(item);
    else rest.push(item);
  }
  return [...commerce, ...rest];
}
