import { describe, expect, it } from "vitest";
import { LOGO_GRID_DEFAULTS, resolveLogoGridOptions } from "./resolve-logo-grid-options";

describe("resolveLogoGridOptions", () => {
  it("uses defaults when fields are missing", () => {
    expect(resolveLogoGridOptions({})).toEqual(LOGO_GRID_DEFAULTS);
  });

  it("reads camelCase and snake_case", () => {
    expect(
      resolveLogoGridOptions({
        layoutStyle: "marquee",
        grayscale: true,
      }),
    ).toEqual({ layoutStyle: "marquee", grayscale: true });

    expect(
      resolveLogoGridOptions({
        layout_style: "grid",
        grayscale: false,
      }),
    ).toEqual({ layoutStyle: "grid", grayscale: false });
  });

  it("normalizes CMS labels and default GRID", () => {
    expect(resolveLogoGridOptions({ layoutStyle: "GRID" }).layoutStyle).toBe("grid");
    expect(resolveLogoGridOptions({ layout_style: "Marquee" }).layoutStyle).toBe("marquee");
    expect(resolveLogoGridOptions({ layoutStyle: "Carrossel Infinito" }).layoutStyle).toBe("marquee");
  });
});
