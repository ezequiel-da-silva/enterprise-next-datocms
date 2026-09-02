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

    expect(heroFirstBlockSuppliesH1(hero)).toBe(true);
  });

  it("returns false when there is no hero or no title", () => {
    expect(heroFirstBlockSuppliesH1(null)).toBe(false);
    expect(
      heroFirstBlockSuppliesH1({
        __typename: "HeroSectionRecord",
        id: "1",
        layoutHero: null,
        titleHero: "",
        showButton: false,
        showImageHero: false,
        showImageOverlay: false,
        buttonHero: [],
        subtitleHero: null,
        imageHero: null,
        imageOverlay: null,
      } as HeroSectionRecord),
    ).toBe(false);
  });
});
