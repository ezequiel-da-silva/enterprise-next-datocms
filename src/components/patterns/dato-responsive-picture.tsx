import { buildDatoSrcSet, clampLayoutDimensions, DATO_DESKTOP_SRCSET_WIDTHS } from "@/lib/datocms-image-loader";
import type { FileFieldLike } from "@/infra/datocms/types-page";
import Image from "next/image";

type DatoResponsivePictureProps = {
  mobile: FileFieldLike;
  desktop?: FileFieldLike | null;
  alt?: string;
  /** Se o Dato não tiver `alt` no asset, usa este texto (ex.: título do post). */
  fallbackAlt?: string;
  /** Imagem puramente decorativa: `alt=""`. */
  decorative?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  /** Default `async` quando a imagem é lazy — não atrasa o LCP. */
  decoding?: "async" | "auto" | "sync";
};

/**
 * `asset` (mobile) + `assetDesktop` (≥md) sem `style` inline (compatível com CSP estrita).
 */
export function DatoResponsivePicture({
  mobile,
  desktop,
  alt,
  fallbackAlt,
  decorative = false,
  className,
  sizes = "(max-width: 767px) 100vw, 960px",
  priority,
  quality = 75,
  decoding,
}: DatoResponsivePictureProps) {
  if (!mobile?.url) {
    return null;
  }

  const resolvedAlt = decorative
    ? ""
    : (alt ?? "").trim() || (mobile.alt ?? "").trim() || (fallbackAlt ?? "").trim();
  const intrinsicW = mobile.width ?? 1200;
  const intrinsicH = mobile.height ?? Math.max(1, Math.round((intrinsicW * 9) / 16));
  const { width, height } = clampLayoutDimensions(intrinsicW, intrinsicH);
  const desktopUrl = desktop?.url;
  const desktopW = Math.min(desktop?.width ?? 1280, 1280);
  const resolvedDecoding = decoding ?? (priority ? "auto" : "async");

  if (desktopUrl) {
    const desktopWidths = [
      ...DATO_DESKTOP_SRCSET_WIDTHS.filter((w) => w <= desktopW),
      desktopW,
    ];
    return (
      <picture>
        <source
          media="(min-width: 768px)"
          srcSet={buildDatoSrcSet(desktopUrl, desktopWidths, quality)}
          sizes={sizes}
        />
        <Image
          src={mobile.url}
          alt={resolvedAlt}
          width={width}
          height={height}
          sizes={sizes}
          quality={quality}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          decoding={resolvedDecoding}
          className={className}
        />
      </picture>
    );
  }

  return (
    <Image
      src={mobile.url}
      alt={resolvedAlt}
      width={width}
      height={height}
      sizes={sizes}
      quality={quality}
      priority={priority}
      loading={priority ? undefined : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding={resolvedDecoding}
      className={className}
    />
  );
}
