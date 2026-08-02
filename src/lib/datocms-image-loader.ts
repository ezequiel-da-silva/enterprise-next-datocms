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
