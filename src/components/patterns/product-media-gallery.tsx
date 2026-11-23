"use client";

import { ProductMediaLightbox } from "@/components/patterns/product-media-lightbox";
import type { ProductGalleryCopy } from "@/lib/i18n/product-gallery-copy";
import type { ProductGalleryItem } from "@/lib/shopify/product-gallery-items";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";

export type { ProductGalleryItem } from "@/lib/shopify/product-gallery-items";

const MAIN_SIZES = "(max-width: 768px) 100vw, 720px";

type ProductMediaGalleryProps = {
  items: ProductGalleryItem[];
  /** When the selected variant changes, sync the active image URL if present in the gallery. */
  activeImageUrl?: string | null;
  onActiveImageUrlChange?: (url: string) => void;
  thumbnailLabel: string;
  galleryCopy: ProductGalleryCopy;
};

export function ProductMediaGallery({
  items,
  activeImageUrl = null,
  onActiveImageUrlChange,
  thumbnailLabel,
  galleryCopy,
}: ProductMediaGalleryProps) {
  const openTriggerRef = useRef<HTMLButtonElement>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const activeIndex = useMemo(() => {
    if (activeImageUrl) {
      const byUrl = items.findIndex((item) => item.kind === "image" && item.url === activeImageUrl);
      if (byUrl >= 0) return byUrl;
    }
    return 0;
  }, [items, activeImageUrl]);

  const [lightboxIndex, setLightboxIndex] = useState(activeIndex);
  const main = items[activeIndex] ?? items[0] ?? null;

  if (!main) return <div />;

  function selectIndex(next: number) {
    const item = items[next];
    if (!item) return;
    if (item.kind === "image") onActiveImageUrlChange?.(item.url);
  }

  function openAt(index: number) {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }

  return (
    <div className="space-y-3">
      <figure className="relative overflow-hidden rounded-xl bg-muted/30">
        {main.kind === "image" ? (
          <button
            ref={openTriggerRef}
            type="button"
            className="relative block w-full cursor-zoom-in border-0 bg-transparent p-0 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            aria-label={galleryCopy.openGallery}
            onClick={() => openAt(activeIndex)}
          >
            <Image
              key={main.url}
              src={main.url}
              alt={main.alt}
              width={main.width}
              height={main.height}
              sizes={MAIN_SIZES}
              priority
              fetchPriority="high"
              className="h-auto w-full object-contain"
            />
          </button>
        ) : (
          <div className="relative">
            <video
              key={main.sources.map((s) => s.url).join("|")}
              controls
              playsInline
              poster={main.previewUrl ?? undefined}
              className="h-auto w-full bg-muted object-contain"
              aria-label={main.alt ?? galleryCopy.playVideo}
            >
              {main.sources.map((source) => (
                <source key={source.url} src={source.url} type={source.mimeType} />
              ))}
            </video>
            <button
              ref={openTriggerRef}
              type="button"
              className="absolute right-3 top-3 rounded-md bg-background/90 px-2 py-1 text-xs font-medium text-foreground shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              onClick={() => openAt(activeIndex)}
            >
              {galleryCopy.openGallery}
            </button>
          </div>
        )}
      </figure>

      {items.length > 1 ? (
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {items.map((item, index) => {
            const pressed = index === activeIndex;
            const thumbUrl =
              item.kind === "image" ? item.url : (item.previewUrl ?? item.sources[0]?.url ?? "");
            const thumbAlt = item.kind === "image" ? "" : "";
            return (
              <li key={item.id}>
                <button
                  type="button"
                  aria-pressed={pressed}
                  aria-label={`${thumbnailLabel} ${index + 1}${item.kind === "video" ? ` — ${galleryCopy.playVideo}` : ""}`}
                  onClick={() => {
                    selectIndex(index);
                    if (item.kind === "video") openAt(index);
                  }}
                  className={[
                    "relative touch-target cursor-pointer overflow-hidden rounded-xl border border-border bg-muted/30 p-0",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    pressed ? "border-foreground" : "hover:border-foreground/40",
                  ].join(" ")}
                >
                  {thumbUrl ? (
                    <Image
                      src={thumbUrl}
                      alt={thumbAlt}
                      width={64}
                      height={64}
                      sizes="64px"
                      loading="lazy"
                      className="h-16 w-16 object-cover"
                    />
                  ) : (
                    <span className="block h-16 w-16 bg-muted" aria-hidden />
                  )}
                  {item.kind === "video" ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-foreground/20" aria-hidden>
                      <svg className="h-4 w-4 text-background" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      <ProductMediaLightbox
        open={lightboxOpen}
        items={items}
        index={lightboxIndex}
        copy={galleryCopy}
        onClose={() => setLightboxOpen(false)}
        onIndexChange={setLightboxIndex}
        returnFocusRef={openTriggerRef}
      />
    </div>
  );
}
