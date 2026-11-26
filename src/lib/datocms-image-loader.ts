import type { ImageLoaderProps } from "next/image";

/**
 * Loader de `next/image` (`images.loaderFile`).
 * Dato (`www.datocms-assets.com`): Imgix `auto=format,compress`.
 * Shopify (`cdn.shopify.com`): `width` no CDN. Outros hosts passam intactos.
 * @see https://www.datocms.com/docs/cdn-settings
 */
const DEFAULT_QUALITY = 75;

/** Keep in sync with `images.deviceSizes` / `images.imageSizes` in `next.config.ts`. */
export const NEXT_IMAGE_DEVICE_SIZES = [384, 480, 640, 672, 750, 828, 960, 1080] as const;
export const NEXT_IMAGE_IMAGE_SIZES = [16, 32, 48, 64, 96, 128, 256, 320, 384] as const;

/** `sizes` of the PDP gallery main image. `100vw` makes next/image emit every width from the first device size up. */
export const PDP_GALLERY_SIZES = "(max-width: 768px) 100vw, 720px";

/**
 * Widths `next/image` puts in `srcSet` when `sizes` contains `100vw`.
 * `384` appears twice because it is in both `imageSizes` and `deviceSizes`.
 */
export function nextWidthsFor100vw(): number[] {
  const deviceSizes = [...NEXT_IMAGE_DEVICE_SIZES].sort((a, b) => a - b);
  const allSizes = [...deviceSizes, ...NEXT_IMAGE_IMAGE_SIZES].sort((a, b) => a - b);
  const floor = deviceSizes[0] ?? 0;
  return allSizes.filter((size) => size >= floor);
}

/** `href` + `imageSrcSet` matching a `priority` `next/image` of this `src` at `PDP_GALLERY_SIZES`. */
export function pdpGalleryPreloadProps(src: string): { href: string; imageSrcSet: string; imageSizes: string } {
  const widths = nextWidthsFor100vw();
  const last = widths[widths.length - 1] ?? NEXT_IMAGE_DEVICE_SIZES[NEXT_IMAGE_DEVICE_SIZES.length - 1];
  return {
    href: datoImageLoader({ src, width: last, quality: DEFAULT_QUALITY }),
    imageSrcSet: widths.map((width) => `${datoImageLoader({ src, width, quality: DEFAULT_QUALITY })} ${width}w`).join(", "),
    imageSizes: PDP_GALLERY_SIZES,
  };
}

function isDatoAssetSrc(src: string): boolean {
  try {
    const host = new URL(src, "https://www.datocms-assets.com").hostname;
    return host === "www.datocms-assets.com";
  } catch {
    return false;
  }
}

/** Shopify CDN accepts `width` and keeps its own compression. Hostname check avoids path spoofing. */
export function shopifyCdnWidthUrl(src: string, width: number): string | null {
  try {
    const url = new URL(src);
    if (url.hostname !== "cdn.shopify.com") return null;
    url.searchParams.set("width", String(Math.max(1, Math.round(width))));
    return url.toString();
  } catch {
    return null;
  }
}

export default function datoImageLoader({ src, width, quality }: ImageLoaderProps): string {
  if (isDatoAssetSrc(src)) {
    const sep = src.includes("?") ? "&" : "?";
    const q = quality ?? DEFAULT_QUALITY;
    return `${src}${sep}auto=format,compress&fit=max&w=${width}&q=${q}`;
  }
  return shopifyCdnWidthUrl(src, width) ?? src;
}

/** Para `<picture>` / `srcSet` fora de `next/image`. */
export function datoAssetUrlWithParams(src: string, width: number, quality: number = DEFAULT_QUALITY): string {
  const sep = src.includes("?") ? "&" : "?";
  return `${src}${sep}auto=format,compress&fit=max&w=${width}&q=${quality}`;
}

/** `srcSet` multi-width para `<source>` em `<picture>` (desktop). */
export function buildDatoSrcSet(
  src: string,
  widths: readonly number[],
  quality: number = DEFAULT_QUALITY,
): string {
  const unique = [...new Set(widths.filter((w) => w > 0))].sort((a, b) => a - b);
  return unique.map((w) => `${datoAssetUrlWithParams(src, w, quality)} ${w}w`).join(", ");
}

/** Larguras para `<picture>` / `srcSet` desktop — inclui passos de card (~320) e split (~480). */
export const DATO_DESKTOP_SRCSET_WIDTHS = [320, 480, 640, 960, 1280] as const;

/** Limite do eixo maior passado a `next/image` (aspect ratio CMS mantém-se). */
export const DATO_LAYOUT_MAX_EDGE = 1280;

/**
 * Escala `width`/`height` do CMS para um eixo máximo, preservando a razão.
 * Evita atributos HTML gigantes (ex. 4896×3264) sem alterar o aspect-ratio.
 */
export function clampLayoutDimensions(
  width: number,
  height: number,
  maxEdge: number = DATO_LAYOUT_MAX_EDGE,
): { width: number; height: number } {
  const w = Math.max(1, width);
  const h = Math.max(1, height);
  const edge = Math.max(w, h);
  if (edge <= maxEdge) return { width: w, height: h };
  const scale = maxEdge / edge;
  return {
    width: Math.max(1, Math.round(w * scale)),
    height: Math.max(1, Math.round(h * scale)),
  };
}

