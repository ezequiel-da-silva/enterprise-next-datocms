import { describe, expect, it } from "vitest";
import { resolveSpecializedImage } from "@/lib/datocms/resolve-specialized-image";

const mobile = { url: "https://www.datocms-assets.com/m.jpg", alt: "m", width: 800, height: 1000 };
const desktop = { url: "https://www.datocms-assets.com/d.jpg", alt: "d", width: 1920, height: 1080 };
const card = { url: "https://www.datocms-assets.com/c.jpg", alt: "c", width: 1200, height: 900 };

describe("resolveSpecializedImage", () => {
  it("maps hero assetMobile + assetDesktop", () => {
    expect(
      resolveSpecializedImage({
        __typename: "HeroImageBlockRecord",
        assetMobile: mobile,
        assetDesktop: desktop,
      }),
    ).toEqual({ mobile, desktop });
  });

  it("maps card and banner assetMobile + assetDesktop", () => {
    expect(
      resolveSpecializedImage({
        __typename: "CardImageBlockRecord",
        assetMobile: card,
        assetDesktop: desktop,
      }),
    ).toEqual({ mobile: card, desktop });
    expect(
      resolveSpecializedImage({
        __typename: "BannerImageBlockRecord",
        assetMobile: card,
        assetDesktop: desktop,
      }),
    ).toEqual({ mobile: card, desktop });
  });

  it("falls back to legacy card/banner `asset` when assetMobile is missing", () => {
    expect(
      resolveSpecializedImage({
        __typename: "CardImageBlockRecord",
        asset: card,
      }),
    ).toEqual({ mobile: card, desktop: null });
  });

  it("keeps legacy ImageBlockRecord dual assets", () => {
    expect(
      resolveSpecializedImage({
        __typename: "ImageBlockRecord",
        asset: mobile,
        assetDesktop: desktop,
      }),
    ).toEqual({ mobile, desktop });
  });

  it("falls back to assetMobile or asset when typename is missing", () => {
    expect(resolveSpecializedImage({ assetMobile: mobile, assetDesktop: desktop })).toEqual({
      mobile,
      desktop,
    });
    expect(resolveSpecializedImage({ asset: card })).toEqual({ mobile: card, desktop: null });
    expect(resolveSpecializedImage(null)).toEqual({ mobile: null, desktop: null });
  });
});
