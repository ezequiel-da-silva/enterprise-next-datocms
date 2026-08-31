import type { CdaStructuredTextValue } from "datocms-structured-text-utils";
import type { HeroSectionRecord } from "@/infra/datocms/types-page";
import { readCdaStringForLogic } from "@/lib/datocms/cda-field";

const HERO_TYPENAMES = new Set(["HeroSectionBlockRecord", "HeroSectionRecord"]);

function pageHeroSuppliesH1(heroPage: HeroSectionRecord | null | undefined): boolean {
  if (!heroPage) return false;
  return readCdaStringForLogic(heroPage, "titleHero", "title_hero").length > 0;
}

/**
 * Quando o campo `heroPage` ou o primeiro bloco do ST é um Hero com `titleHero` preenchido, serve de `<h1>` principal
 * (evita duplicar com o título da página).
 */
export function heroFirstBlockSuppliesH1(
  st: CdaStructuredTextValue | null | undefined,
  heroPage?: HeroSectionRecord | null,
): boolean {
  if (pageHeroSuppliesH1(heroPage)) {
    return true;
  }
  const blocks = st?.blocks;
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return false;
  }
  const first = blocks[0] as { __typename?: string; titleHero?: string | null; title_hero?: string | null } | undefined;
  if (!first?.__typename || !HERO_TYPENAMES.has(first.__typename)) {
    return false;
  }
  return readCdaStringForLogic(first, "titleHero", "title_hero").length > 0;
}
