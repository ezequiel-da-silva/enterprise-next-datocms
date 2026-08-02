import { describe, expect, it } from "vitest";
import { resolveCtaBannerImage } from "@/lib/datocms/resolve-cta-banner-image";

const validImageBlock = {
  id: "img-1",
  asset: { url: "https://example.com/photo.jpg", alt: "Photo", width: 800, height: 600 },
};

describe("resolveCtaBannerImage", () => {
  it("never enables image for centered variant", () => {
    expect(
      resolveCtaBannerImage(
        { hasImage: true, imageBanner: [validImageBlock] },
        "centered",
      ),
    ).toEqual({ enabled: false, block: null, hasValidAsset: false });
  });

  it("disables image when hasImage is false on split", () => {
    expect(
      resolveCtaBannerImage(
        { hasImage: false, imageBanner: [validImageBlock] },
        "split",
      ),
    ).toEqual({ enabled: false, block: null, hasValidAsset: false });
  });

  it("enables image on split when hasImage is true and asset is valid", () => {
    expect(
      resolveCtaBannerImage(
        { hasImage: true, imageBanner: [validImageBlock] },
        "split",
      ),
    ).toEqual({
      enabled: true,
      block: validImageBlock,
      hasValidAsset: true,
    });
  });

  it("falls back when card_inset has hasImage but empty imageBanner", () => {
    expect(
      resolveCtaBannerImage({ hasImage: true, imageBanner: [] }, "card_inset"),
    ).toEqual({ enabled: true, block: null, hasValidAsset: false });
  });

  it("accepts snake_case has_image and image_banner", () => {
    expect(
      resolveCtaBannerImage(
        { has_image: true, image_banner: [validImageBlock] },
        "card_inset",
      ),
    ).toEqual({
      enabled: true,
      block: validImageBlock,
      hasValidAsset: true,
    });
  });

  it("ignores blocks without a valid asset url", () => {
    expect(
      resolveCtaBannerImage(
        {
          hasImage: true,
          imageBanner: [{ asset: { url: "" } }, { asset: null }],
        },
        "split",
      ),
    ).toEqual({ enabled: true, block: null, hasValidAsset: false });
  });
});
