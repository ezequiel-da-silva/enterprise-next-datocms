"use client";

import { IconButton } from "@/components/atoms/icon-button";
import type { ProductGalleryItem } from "@/components/patterns/product-media-gallery";
import { useClientMounted } from "@/lib/a11y/use-client-mounted";
import { useModalDialog } from "@/lib/a11y/use-modal-dialog";
import { shopifyCdnWidthUrl } from "@/lib/datocms-image-loader";
import type { ProductGalleryCopy } from "@/lib/i18n/product-gallery-copy";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { createPortal } from "react-dom";

const LIGHTBOX_WIDTH = 2400;
const MIN_SCALE = 1;
const MAX_SCALE = 4;

type ProductMediaLightboxProps = {
  open: boolean;
  items: ProductGalleryItem[];
  index: number;
  copy: ProductGalleryCopy;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  returnFocusRef?: RefObject<HTMLElement | null>;
};

type PointerMap = Map<number, { x: number; y: number }>;

function highResUrl(url: string): string {
  return shopifyCdnWidthUrl(url, LIGHTBOX_WIDTH) ?? url;
}

function pointerDistance(map: PointerMap): number {
  const pts = [...map.values()];
  if (pts.length < 2) return 0;
  return Math.hypot(pts[0]!.x - pts[1]!.x, pts[0]!.y - pts[1]!.y);
}

function LightboxZoomImage({ item }: { item: Extract<ProductGalleryItem, { kind: "image" }> }) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const pointersRef = useRef<PointerMap>(new Map());
  const pinchRef = useRef<{ distance: number; scale: number } | null>(null);
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  const clampScale = useCallback(
    (value: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, value)),
    [],
  );

  const onWheel = (e: ReactWheelEvent) => {
    e.preventDefault();
    setScale((prev) => clampScale(prev + (e.deltaY < 0 ? 0.15 : -0.15)));
  };

  const onDoubleClick = () => {
    setScale((prev) => (prev > 1.1 ? 1 : 2));
    setOffset({ x: 0, y: 0 });
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const map = pointersRef.current;
    map.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (map.size === 2) {
      pinchRef.current = { distance: pointerDistance(map), scale };
      dragRef.current = null;
      return;
    }
    if (scale > 1) {
      dragRef.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
    }
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const map = pointersRef.current;
    if (!map.has(e.pointerId)) return;
    map.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (map.size === 2 && pinchRef.current && pinchRef.current.distance > 0) {
      setScale(clampScale(pinchRef.current.scale * (pointerDistance(map) / pinchRef.current.distance)));
      return;
    }
    if (dragRef.current && map.size === 1) {
      setOffset({
        x: dragRef.current.ox + (e.clientX - dragRef.current.x),
        y: dragRef.current.oy + (e.clientY - dragRef.current.y),
      });
    }
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const map = pointersRef.current;
    map.delete(e.pointerId);
    if (map.size < 2) pinchRef.current = null;
    if (map.size === 0) dragRef.current = null;
  };

  return (
    <div
      className="relative flex min-h-0 flex-1 touch-none items-center justify-center overflow-hidden rounded-xl bg-background/5"
      onWheel={onWheel}
      onDoubleClick={onDoubleClick}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- high-res CDN URL with explicit width; avoid double loader resize */}
      <img
        src={highResUrl(item.url)}
        alt={item.alt}
        width={item.width}
        height={item.height}
        className="max-h-[min(80dvh,48rem)] w-auto max-w-full select-none object-contain"
        style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}
        draggable={false}
      />
    </div>
  );
}

export function ProductMediaLightbox({
  open,
  items,
  index,
  copy,
  onClose,
  onIndexChange,
  returnFocusRef,
}: ProductMediaLightboxProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const mounted = useClientMounted();
  const item = items[index] ?? null;

  useModalDialog({
    open,
    panelRef,
    returnFocusRef,
    onClose,
  });

  useEffect(() => {
    if (!open || items.length < 2) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onIndexChange((index - 1 + items.length) % items.length);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onIndexChange((index + 1) % items.length);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, index, items.length, onIndexChange]);

  if (!mounted || !open || !item) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 cursor-pointer bg-foreground/80"
        aria-label={copy.closeGallery}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[min(100dvh,56rem)] w-full max-w-5xl flex-col gap-3 outline-none"
      >
        <div className="flex items-center justify-between gap-3 text-background">
          <p id={titleId} className="truncate text-sm font-medium">
            {item.kind === "image" ? item.alt : (item.alt ?? copy.playVideo)}
          </p>
          <div className="flex shrink-0 items-center gap-1">
            {items.length > 1 ? (
              <>
                <IconButton
                  type="button"
                  aria-label={copy.previousMedia}
                  onClick={() => onIndexChange((index - 1 + items.length) % items.length)}
                  className="border-transparent bg-transparent text-background shadow-none hover:bg-background/10"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </IconButton>
                <IconButton
                  type="button"
                  aria-label={copy.nextMedia}
                  onClick={() => onIndexChange((index + 1) % items.length)}
                  className="border-transparent bg-transparent text-background shadow-none hover:bg-background/10"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </IconButton>
              </>
            ) : null}
            <IconButton
              type="button"
              aria-label={copy.closeGallery}
              onClick={onClose}
              className="border-transparent bg-transparent text-background shadow-none hover:bg-background/10"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </IconButton>
          </div>
        </div>

        {item.kind === "image" ? (
          <LightboxZoomImage key={item.id} item={item} />
        ) : (
          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl bg-background/5">
            <video
              key={item.sources.map((s) => s.url).join("|")}
              controls
              playsInline
              poster={item.previewUrl ?? undefined}
              className="max-h-[min(80dvh,48rem)] w-full max-w-full rounded-lg bg-black"
            >
              {item.sources.map((source) => (
                <source key={source.url} src={source.url} type={source.mimeType} />
              ))}
            </video>
          </div>
        )}

        {item.kind === "image" ? (
          <p className="text-center text-xs text-background/80">{copy.zoomHint}</p>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
