import type { ImageLoaderProps } from "next/image";

/**
 * Loader de `next/image` (`images.loaderFile`).
 * Dato (`www.datocms-assets.com`): Imgix `auto=format,compress`.
 * Shopify (`cdn.shopify.com`): `width` no CDN. Outros hosts passam intactos.
 * @see https://www.datocms.com/docs/cdn-settings
 */
const DEFAULT_QUALITY = 75;

function isDatoAssetSrc(src: string): boolean {
  try {
    const host = new URL(src, "https://www.datocms-assets.com").hostname;
    return host === "www.datocms-assets.com";
  } catch {
    return false;
  }
}

/** Shopify CDN accepts `width` and keeps its own compression. Hostname check avoids path spoofing. */
function shopifyWidthUrl(src: string, width: number): string | null {
  try {
    const url = new URL(src);
    if (url.hostname !== "cdn.shopify.com") return null;
    url.searchParams.set("width", String(width));
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
  return shopifyWidthUrl(src, width) ?? src;
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

