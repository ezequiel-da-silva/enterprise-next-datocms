import { describe, expect, it } from "vitest";
import { formatProductSpecEyebrow } from "@/lib/i18n/product-spec-eyebrow";

describe("formatProductSpecEyebrow", () => {
  it("joins available specs with middots", () => {
    expect(
      formatProductSpecEyebrow("en", {
        profile: "rocker",
        flex: 4,
        terrain: "powder",
        riderLevel: "intermediate",
      }),
    ).toBe("Rocker · 4/10 · Powder · Intermediate");
  });

  it("omits missing pieces", () => {
    expect(
      formatProductSpecEyebrow("pt", {
        profile: "camber",
        flex: null,
        terrain: null,
        riderLevel: null,
      }),
    ).toBe("Camber");
  });

  it("returns null when empty", () => {
    expect(
      formatProductSpecEyebrow("en", {
        profile: null,
        flex: null,
        terrain: null,
        riderLevel: null,
      }),
    ).toBeNull();
  });
});
