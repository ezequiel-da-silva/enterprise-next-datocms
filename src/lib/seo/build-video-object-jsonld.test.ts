import { describe, expect, it } from "vitest";
import {
  buildVideoObjectJsonLd,
  secondsToIso8601Duration,
} from "@/lib/seo/build-video-object-jsonld";

describe("buildVideoObjectJsonLd", () => {
  it("formats duration and includes content fields", () => {
    expect(secondsToIso8601Duration(18)).toBe("PT18S");
    expect(secondsToIso8601Duration(90)).toBe("PT1M30S");

    const node = buildVideoObjectJsonLd({
      id: "vid-1",
      name: "Demo",
      contentUrl: "https://stream.mux.com/x/high.mp4",
      thumbnailUrl: "https://image.mux.com/x/thumbnail.jpg",
      durationSeconds: 18,
      width: 1280,
      height: 720,
    });

    expect(node["@type"]).toBe("VideoObject");
    expect(node.duration).toBe("PT18S");
    expect(node.contentUrl).toContain("high.mp4");
  });
});
