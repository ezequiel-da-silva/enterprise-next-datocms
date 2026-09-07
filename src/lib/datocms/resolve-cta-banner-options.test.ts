import { describe, expect, it } from "vitest";
import { resolveCtaBannerOptions } from "@/lib/datocms/resolve-cta-banner-options";

describe("resolveCtaBannerOptions", () => {
  it("returns default bgTheme when advanced_options is false but keeps variant from CMS", () => {
    expect(resolveCtaBannerOptions({ advancedOptions: false, variant: "split", bgTheme: "muted" })).toEqual({
      variant: "split",
      bgTheme: "primary",
    });
  });

  it("reads variant and bg_theme when advanced_options is true", () => {
    expect(
      resolveCtaBannerOptions({
        advancedOptions: true,
        variant: "split",
        bgTheme: "muted",
      }),
    ).toEqual({
      variant: "split",
      bgTheme: "muted",
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
      }),
    ).toEqual({
      variant: "centered",
      bgTheme: "transparent",
    });
  });
});
