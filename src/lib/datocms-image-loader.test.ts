import { describe, expect, it } from "vitest";
import {
  buildDatoSrcSet,
  clampLayoutDimensions,
  datoAssetUrlWithParams,
  DATO_DESKTOP_SRCSET_WIDTHS,
} from "@/lib/datocms-image-loader";

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

  it("includes card and split steps in desktop presets", () => {
    expect(DATO_DESKTOP_SRCSET_WIDTHS).toEqual([320, 480, 640, 960, 1280]);
  });
});

describe("clampLayoutDimensions", () => {
  it("preserves small dimensions", () => {
    expect(clampLayoutDimensions(800, 600)).toEqual({ width: 800, height: 600 });
  });

  it("scales down while preserving aspect ratio", () => {
    const { width, height } = clampLayoutDimensions(4896, 3264);
    expect(width).toBe(1280);
    expect(height).toBe(Math.round((3264 / 4896) * 1280));
    expect(Math.abs(width / height - 4896 / 3264)).toBeLessThan(0.01);
  });

  it("clamps by the larger edge when portrait", () => {
    const { width, height } = clampLayoutDimensions(2000, 4000);
    expect(height).toBe(1280);
    expect(width).toBe(640);
  });
});