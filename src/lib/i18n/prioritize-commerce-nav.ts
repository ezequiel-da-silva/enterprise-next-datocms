import type { NavItemRecord } from "@/infra/datocms/types-navigation";

const COMMERCE_LABEL =
  /\b(shop|loja|tienda|collections?|colec(?:[aã]o|ões|iones?)|best\s*of|melhores|destaques?)\b/i;
const COMMERCE_PATH =
  /\/(shop|loja|tienda|collections?|colec(?:oes|iones)|best|melhores)(\/|$)/i;

function isCommerceLink(item: NavItemRecord): boolean {
  if (COMMERCE_LABEL.test(item.navItemLabel)) return true;
  return COMMERCE_PATH.test(item.navItemLink);
}

/**
 * Stable partition: commerce links first (Shop / Collections / Best of), then the rest.
 * Relative order within each group is preserved.
 */
export function prioritizeCommerceNavLinks(items: readonly NavItemRecord[]): NavItemRecord[] {
  const commerce: NavItemRecord[] = [];
  const rest: NavItemRecord[] = [];
  for (const item of items) {
    if (isCommerceLink(item)) commerce.push(item);
    else rest.push(item);
  }
  return [...commerce, ...rest];
}
