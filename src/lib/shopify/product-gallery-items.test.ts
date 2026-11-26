import { describe, expect, it } from "vitest";
import { resolveGalleryMainImageUrl, type ProductGalleryItem } from "@/lib/shopify/product-gallery-items";

const image = (url: string): ProductGalleryItem => ({
  kind: "image",
  id: url,
  url,
  alt: url,
  width: 800,
  height: 800,
});

describe("resolveGalleryMainImageUrl", () => {
  it("uses the active variant image when it is already in the media list", () => {
    const url = resolveGalleryMainImageUrl({
      mediaItems: [image("https://cdn.shopify.com/a.jpg"), image("https://cdn.shopify.com/b.jpg")],
      images: [],
      variantImages: [],
      activeImageUrl: "https://cdn.shopify.com/b.jpg",
    });
    expect(url).toBe("https://cdn.shopify.com/b.jpg");
  });

  it("appends a variant image that is missing from media", () => {
    const url = resolveGalleryMainImageUrl({
      mediaItems: [image("https://cdn.shopify.com/a.jpg")],
      images: [],
      variantImages: [{ url: "https://cdn.shopify.com/c.jpg", alt: "c", width: 10, height: 10 }],
      activeImageUrl: "https://cdn.shopify.com/c.jpg",
    });
    expect(url).toBe("https://cdn.shopify.com/c.jpg");
  });

  it("returns null when the first slot is a video and no active image matches", () => {
    const url = resolveGalleryMainImageUrl({
      mediaItems: [
        {
          kind: "video",
          id: "v",
          alt: null,
          previewUrl: null,
          previewWidth: 800,
          previewHeight: 800,
          sources: [{ url: "https://cdn.shopify.com/v.mp4", mimeType: "video/mp4" }],
        },
      ],
      images: [],
      variantImages: [],
      activeImageUrl: null,
    });
    expect(url).toBeNull();
  });
});
