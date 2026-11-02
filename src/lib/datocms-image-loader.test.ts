import { describe, expect, it } from "vitest";
import datoImageLoader, {
  buildDatoSrcSet,
  clampLayoutDimensions,
  datoAssetUrlWithParams,
  DATO_DESKTOP_SRCSET_WIDTHS,
} from "@/lib/datocms-image-loader";

describe("datoImageLoader", () => {
  it("keeps Imgix params on Dato assets", () => {
    const src = "https://www.datocms-assets.com/x/y.jpg";
    expect(datoImageLoader({ src, width: 640, quality: 75 })).toBe(
      `${src}?auto=format,compress&fit=max&w=640&q=75`,
    );
  });

  it("sets Shopify width and keeps the existing query", () => {
    const src = "https://cdn.shopify.com/s/files/1/image.jpg?v=123";
    const out = new URL(datoImageLoader({ src, width: 480, quality: 75 }));
    expect(out.hostname).toBe("cdn.shopify.com");
    expect(out.searchParams.get("width")).toBe("480");
    expect(out.searchParams.get("v")).toBe("123");
  });

  it("leaves other hosts untouched", () => {
    const src = "https://example.com/cdn.shopify.com/photo.jpg";
    expect(datoImageLoader({ src, width: 320, quality: 75 })).toBe(src);
  });
});

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