import { describe, expect, it } from "vitest";
import {
  CAROUSEL_SETTING_DEFAULTS,
  resolveCarouselSetting,
} from "@/lib/datocms/resolve-carousel-setting";

describe("resolveCarouselSetting", () => {
  it("uses defaults when the block is absent", () => {
    expect(resolveCarouselSetting([])).toEqual(CAROUSEL_SETTING_DEFAULTS);
  });

  it("reads the CDA single-block array", () => {
    expect(
      resolveCarouselSetting([
        {
          autoplay: true,
          autoplayInterval: 8,
          showArrows: false,
          showDots: false,
          loop: false,
        },
      ]),
    ).toEqual({
      autoplay: true,
      autoplayInterval: 8,
      showArrows: false,
      showDots: false,
      loop: false,
    });
  });

  it("accepts a direct object and snake_case aliases", () => {
    expect(
      resolveCarouselSetting({
        autoplay: true,
        autoplay_interval: 2,
        show_arrows: false,
        show_dots: true,
        loop: false,
      }),
    ).toMatchObject({
      autoplay: true,
      autoplayInterval: 3,
      showArrows: false,
      showDots: true,
      loop: false,
    });
  });
});
