import type { HeroSectionRecord } from "@/infra/datocms/types-page";
import { readCdaStringForLogic } from "@/lib/datocms/cda-field";

/**
 * Quando `heroPage` tem `titleHero`, serve de `<h1>` (evita duplicar o título da página).
 */
export function heroFirstBlockSuppliesH1(heroPage?: HeroSectionRecord | null): boolean {
  if (!heroPage) return false;
  return readCdaStringForLogic(heroPage, "titleHero", "title_hero").length > 0;
}
