import type { ImageLoaderProps } from "next/image";

/**
 * Params Imgix do Dato (`www.datocms-assets.com`) — registado em `next.config.ts` como
 * `images.loaderFile` para não passar função de Server Components para `<Image />`.
 * @see https://www.datocms.com/docs/cdn-settings
 */
const DEFAULT_QUALITY = 75;

export default function datoImageLoader({ src, width, quality }: ImageLoaderProps): string {
  const sep = src.includes("?") ? "&" : "?";
  const q = quality ?? DEFAULT_QUALITY;
  return `${src}${sep}auto=format,compress&fit=max&w=${width}&q=${q}`;
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

