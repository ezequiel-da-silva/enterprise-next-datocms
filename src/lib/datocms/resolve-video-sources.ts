/**
 * Fontes de vídeo do Dato.
 *
 * O Dato pode desativar o acesso ao ficheiro original ("Serving raw videos is
 * disabled by admin"). Nesse caso o vídeo só está disponível via Mux, através de
 * `asset.video`: MP4 (`mp4Url`, quando as renditions estão ativas) e HLS
 * (`streamingUrl`). Só usamos `asset.url` quando não há dados Mux.
 */

const HLS_MIME = "application/vnd.apple.mpegurl";

export type DatoVideoUpload = {
  muxPlaybackId?: string | null;
  streamingUrl?: string | null;
  mp4Url?: string | null;
  thumbnailUrl?: string | null;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
};

export type DatoVideoAsset = {
  url?: string | null;
  title?: string | null;
  width?: number | null;
  height?: number | null;
  video?: DatoVideoUpload | null;
};

export type VideoSource = { src: string; type?: string };

export type ResolvedVideo = {
  sources: VideoSource[];
  poster?: string;
  width?: number;
  height?: number;
  /** Segundos (Mux); para VideoObject ISO 8601. */
  durationSeconds?: number;
  /** true quando só existe HLS — Chrome/Firefox precisam das renditions MP4 no Dato. */
  hlsOnly: boolean;
};

function trimmed(value: string | null | undefined): string | undefined {
  const v = value?.trim();
  return v ? v : undefined;
}

function positive(value: number | null | undefined): number | undefined {
  return typeof value === "number" && value > 0 ? value : undefined;
}

export function resolveVideoSources(asset: DatoVideoAsset | null | undefined): ResolvedVideo | null {
  if (!asset) return null;

  const mux = asset.video;
  const streamingUrl = trimmed(mux?.streamingUrl);
  const mp4Url = trimmed(mux?.mp4Url);

  /*
   * MP4 primeiro: serve direto de stream.mux.com e toca em todos os browsers.
   * O HLS é fallback para uploads sem renditions MP4 — o Mux redireciona o
   * manifest para o CDN da região (`*.fastly.mux.com`), daí `*.mux.com` no CSP.
   */
  const sources: VideoSource[] = [];
  if (mp4Url) {
    sources.push({ src: mp4Url, type: "video/mp4" });
  }
  if (streamingUrl) {
    sources.push({ src: streamingUrl, type: HLS_MIME });
  }

  /* Sem dados Mux: upload não transcodificado — resta a URL original. */
  if (sources.length === 0) {
    const raw = trimmed(asset.url);
    if (!raw) return null;
    sources.push({ src: raw });
  }

  return {
    sources,
    poster: trimmed(mux?.thumbnailUrl),
    width: positive(mux?.width) ?? positive(asset.width),
    height: positive(mux?.height) ?? positive(asset.height),
    durationSeconds: positive(mux?.duration),
    hlsOnly: Boolean(streamingUrl) && !mp4Url,
  };
}
