import { describe, expect, it } from "vitest";
import { resolveCtaBannerOptions, sanitizeSectionId } from "@/lib/datocms/resolve-cta-banner-options";

describe("resolveCtaBannerOptions", () => {
  it("returns default bgTheme when advanced_options is false but keeps variant from CMS", () => {
    expect(resolveCtaBannerOptions({ advancedOptions: false, variant: "split", bgTheme: "muted" })).toEqual({
      variant: "split",
      bgTheme: "primary",
      sectionId: undefined,
    });
  });

  it("reads variant, bg_theme and section_id when advanced_options is true", () => {
    expect(
      resolveCtaBannerOptions({
        advancedOptions: true,
        variant: "split",
        bgTheme: "muted",
        sectionId: "Fale Conosco!",
      }),
    ).toEqual({
      variant: "split",
      bgTheme: "muted",
      sectionId: "fale-conosco",
    });
  });

  it("parses Portuguese variant labels from Dato select", () => {
    expect(resolveCtaBannerOptions({ advancedOptions: true, variant: "Centralizado" }).variant).toBe("centered");
    expect(resolveCtaBannerOptions({ advancedOptions: true, variant: "card_inset" }).variant).toBe("card_inset");
  });

  it("accepts snake_case API keys", () => {
    expect(
      resolveCtaBannerOptions({
        advanced_options: true,
        bg_theme: "transparent",
        section_id: "cta-final",
      }),
    ).toEqual({
      variant: "centered",
      bgTheme: "transparent",
      sectionId: "cta-final",
    });
  });
});

describe("sanitizeSectionId", () => {
  it("slugifies anchor ids", () => {
    expect(sanitizeSectionId("  Fale Conosco  ")).toBe("fale-conosco");
    expect(sanitizeSectionId("---")).toBeUndefined();
  });
});
