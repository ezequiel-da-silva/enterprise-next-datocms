import { describe, expect, it } from "vitest";
import {
  FEATURE_GRID_DEFAULTS,
  resolveFeatureGridOptions,
} from "@/lib/datocms/resolve-feature-grid-options";

describe("resolveFeatureGridOptions", () => {
  it("uses defaults when advanced options are disabled", () => {
    expect(resolveFeatureGridOptions({})).toEqual(FEATURE_GRID_DEFAULTS);
    expect(
      resolveFeatureGridOptions({
        advancedOptions: false,
        carouselOptions: [{ autoplay: true, showArrows: false }],
        sectionId: "ignorado",
      }),
    ).toEqual(FEATURE_GRID_DEFAULTS);
  });

  it("always respects and normalizes the selected variant", () => {
    expect(resolveFeatureGridOptions({ variant: "Full bleed" }).variant).toBe("full_bleed");
    expect(resolveFeatureGridOptions({ variant: "Sangria total" }).variant).toBe("full_bleed");
    expect(resolveFeatureGridOptions({ variant: "Cards" }).variant).toBe("cards");
  });

  it("reads camelCase advanced options", () => {
    expect(
      resolveFeatureGridOptions({
        advancedOptions: true,
        variant: "full_bleed",
        carouselOptions: [{
          autoplay: true,
          autoplayInterval: 7,
          showArrows: false,
          showDots: false,
          loop: false,
        }],
        sectionId: "Destaques Ágeis!",
      }),
    ).toEqual({
      variant: "full_bleed",
      carousel: {
        autoplay: true,
        autoplayInterval: 7,
        showArrows: false,
        showDots: false,
        loop: false,
      },
      sectionId: "destaques-ageis",
    });
  });

  it("reads snake_case aliases and clamps the interval", () => {
    expect(
      resolveFeatureGridOptions({
        advanced_options: true,
        carousel_options: [{
          autoplay_interval: 1,
          show_arrows: false,
          show_dots: true,
        }],
        section_id: "  feature_grid--principal  ",
      }),
    ).toMatchObject({
      carousel: {
        autoplayInterval: 3,
        showArrows: false,
        showDots: true,
      },
      sectionId: "feature_grid--principal",
    });

    expect(
      resolveFeatureGridOptions({
        advanced_options: true,
        carousel_options: [{ autoplay_interval: 99 }],
      }).carousel.autoplayInterval,
    ).toBe(60);
  });
});
