import { describe, expect, it } from "vitest";
import type { HeroSectionRecord } from "@/infra/datocms/types-page";
import { heroFirstBlockSuppliesH1 } from "@/lib/datocms/hero-first-block";

describe("heroFirstBlockSuppliesH1", () => {
  it("returns true when heroPage has title", () => {
    const hero = {
      __typename: "HeroSectionRecord",
      id: "1",
      layoutHero: null,
      titleHero: "Hero title",
      showButton: false,
      showImageHero: false,
      showImageOverlay: false,
      buttonHero: [],
      subtitleHero: null,
      imageHero: null,
      imageOverlay: null,
    } as HeroSectionRecord;

    expect(heroFirstBlockSuppliesH1(null, hero)).toBe(true);
  });

  it("returns false when no hero and empty ST", () => {
    expect(heroFirstBlockSuppliesH1(null, null)).toBe(false);
    expect(heroFirstBlockSuppliesH1({ value: null, blocks: [] }, null)).toBe(false);
  });
});
