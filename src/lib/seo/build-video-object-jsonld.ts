/**
 * Converte segundos para ISO 8601 duration (ex.: 18 → `PT18S`, 90 → `PT1M30S`).
 */
export function secondsToIso8601Duration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  let out = "PT";
  if (h > 0) out += `${h}H`;
  if (m > 0) out += `${m}M`;
  if (s > 0 || (h === 0 && m === 0)) out += `${s}S`;
  return out;
}

export type VideoObjectInput = {
  id: string;
  name: string;
  description?: string;
  contentUrl: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  width?: number;
  height?: number;
};

export function buildVideoObjectJsonLd(input: VideoObjectInput): Record<string, unknown> {
  return {
    "@type": "VideoObject",
    "@id": `https://schema.org/VideoObject/${input.id}`,
    name: input.name,
    ...(input.description ? { description: input.description } : {}),
    contentUrl: input.contentUrl,
    ...(input.thumbnailUrl ? { thumbnailUrl: input.thumbnailUrl } : {}),
    ...(input.durationSeconds != null
      ? { duration: secondsToIso8601Duration(input.durationSeconds) }
      : {}),
    ...(input.width ? { width: input.width } : {}),
    ...(input.height ? { height: input.height } : {}),
  };
}
