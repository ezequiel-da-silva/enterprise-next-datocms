import { describe, expect, it } from "vitest";
import { buildDatoSrcSet, datoAssetUrlWithParams } from "@/lib/datocms-image-loader";

describe("buildDatoSrcSet", () => {
  it("builds comma-separated width descriptors", () => {
    const src = "https://www.datocms-assets.com/x/y.jpg";
    const set = buildDatoSrcSet(src, [640, 960]);
    expect(set).toBe(
      `${datoAssetUrlWithParams(src, 640)} 640w, ${datoAssetUrlWithParams(src, 960)} 960w`,
    );
  });

  it("dedupes and sorts widths", () => {
    const src = "https://www.datocms-assets.com/x/y.jpg";
    const set = buildDatoSrcSet(src, [960, 640, 960, 0]);
    expect(set.split(", ")).toHaveLength(2);
    expect(set.startsWith(datoAssetUrlWithParams(src, 640))).toBe(true);
  });
});
