import { describe, expect, it } from "vitest";
import { resolveVideoSources } from "@/lib/datocms/resolve-video-sources";

const RAW = "https://www.datocms-assets.com/1/video.mp4";

describe("resolveVideoSources", () => {
  it("serves the Mux MP4 first and never the raw asset URL", () => {
    const resolved = resolveVideoSources({
      url: RAW,
      width: 1920,
      height: 1080,
      video: {
        muxPlaybackId: "abc",
        streamingUrl: "https://stream.mux.com/abc.m3u8",
        mp4Url: "https://stream.mux.com/abc/high.mp4",
        thumbnailUrl: "https://image.mux.com/abc/thumbnail.jpg",
        width: 2732,
        height: 1440,
        duration: 12,
      },
    });

    expect(resolved?.sources).toEqual([
      { src: "https://stream.mux.com/abc/high.mp4", type: "video/mp4" },
      { src: "https://stream.mux.com/abc.m3u8", type: "application/vnd.apple.mpegurl" },
    ]);
    expect(resolved?.sources.some((s) => s.src === RAW)).toBe(false);
    expect(resolved?.poster).toBe("https://image.mux.com/abc/thumbnail.jpg");
    expect(resolved?.width).toBe(2732);
    expect(resolved?.hlsOnly).toBe(false);
  });

  it("flags hlsOnly when Dato has no MP4 renditions", () => {
    const resolved = resolveVideoSources({
      url: RAW,
      video: {
        muxPlaybackId: "abc",
        streamingUrl: "https://stream.mux.com/abc.m3u8",
        mp4Url: null,
        thumbnailUrl: "https://image.mux.com/abc/thumbnail.jpg",
        width: 1280,
        height: 720,
      },
    });

    expect(resolved?.sources).toHaveLength(1);
    expect(resolved?.hlsOnly).toBe(true);
  });

  it("falls back to the raw URL when there is no Mux data", () => {
    const resolved = resolveVideoSources({ url: RAW, width: 640, height: 360 });
    expect(resolved?.sources).toEqual([{ src: RAW }]);
    expect(resolved?.poster).toBeUndefined();
    expect(resolved?.width).toBe(640);
    expect(resolved?.hlsOnly).toBe(false);
  });

  it("returns null without any playable source", () => {
    expect(resolveVideoSources(null)).toBeNull();
    expect(resolveVideoSources({ url: "   " })).toBeNull();
  });
});
