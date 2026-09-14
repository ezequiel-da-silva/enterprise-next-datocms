import type { HeroSectionRecord } from "@/infra/datocms/types-page";
import { readCdaStringForLogic } from "@/lib/datocms/cda-field";

/**
 * Quando `heroPage` tem `titleHero`, serve de `<h1>` (evita duplicar o título da página).
 */
export function heroFirstBlockSuppliesH1(heroPage?: HeroSectionRecord | null): boolean {
  return Boolean(heroHeadingText(heroPage));
}

/** Título visível do H1 (hero) — sem stega, para breadcrumb e JSON-LD. */
export function heroHeadingText(heroPage?: HeroSectionRecord | null): string {
  if (!heroPage) return "";
  return readCdaStringForLogic(heroPage, "titleHero", "title_hero");
}

/**
 * Nome público da página: H1 do hero quando existe, senão o título do record.
 * Alinha breadcrumb visível e `WebPage.name` ao heading, não ao título interno do CMS.
 */
export function resolveVisiblePageTitle(page: {
  title: string;
  heroPage?: HeroSectionRecord | null;
}): string {
  return heroHeadingText(page.heroPage) || page.title.trim();
}
