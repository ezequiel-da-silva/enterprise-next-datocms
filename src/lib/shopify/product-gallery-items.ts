import type { StorefrontProductMedia, StorefrontVideoSource } from "@/infra/shopify/storefront";

export type ProductGalleryImage = {
  kind: "image";
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
};

export type ProductGalleryVideo = {
  kind: "video";
  id: string;
  alt: string | null;
  previewUrl: string | null;
  previewWidth: number;
  previewHeight: number;
  sources: StorefrontVideoSource[];
};

export type ProductGalleryItem = ProductGalleryImage | ProductGalleryVideo;

/** Map Storefront `media` (image + video) into gallery items. Safe for Server Components. */
export function toGalleryItemsFromMedia(
  media: StorefrontProductMedia[],
  fallbackTitle: string,
): ProductGalleryItem[] {
  const items: ProductGalleryItem[] = [];
  media.forEach((entry, index) => {
    if (entry.kind === "image") {
      const url = entry.image.url.trim();
      if (!url) return;
      items.push({
        kind: "image",
        id: `img-${url}`,
        url,
        alt: entry.image.altText?.trim() || fallbackTitle,
        width: entry.image.width && entry.image.width > 0 ? entry.image.width : 800,
        height: entry.image.height && entry.image.height > 0 ? entry.image.height : 800,
      });
      return;
    }
    if (entry.sources.length === 0) return;
    const preview = entry.previewImage;
    items.push({
      kind: "video",
      id: `vid-${entry.sources[0]!.url}-${index}`,
      alt: entry.alt,
      previewUrl: preview?.url ?? null,
      previewWidth: preview?.width && preview.width > 0 ? preview.width : 800,
      previewHeight: preview?.height && preview.height > 0 ? preview.height : 800,
      sources: entry.sources,
    });
  });
  return items;
}

/** Fallback when Storefront `media` is empty — use classic image list. */
export function toGalleryItemsFromImages(
  images: { url: string; alt: string; width: number; height: number }[],
): ProductGalleryItem[] {
  return images.map((image) => ({
    kind: "image" as const,
    id: `img-${image.url}`,
    url: image.url,
    alt: image.alt,
    width: image.width,
    height: image.height,
  }));
}
