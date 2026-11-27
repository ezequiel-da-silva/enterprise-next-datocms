import { describe, expect, it } from "vitest";
import { accessibleNameIncludesVisible, ariaLabelIfLabelInName } from "@/lib/a11y/label-in-name";

describe("accessibleNameIncludesVisible", () => {
  it("accepts names that contain the visible label", () => {
    expect(accessibleNameIncludesVisible("Shop now (opens in new window)", "Shop now")).toBe(true);
    expect(accessibleNameIncludesVisible("SHOP NOW", "shop now")).toBe(true);
  });

  it("rejects CMS placeholders that omit the visible text", () => {
    expect(accessibleNameIncludesVisible("Link ARIA", "Google")).toBe(false);
    expect(accessibleNameIncludesVisible("ARIA do link", "Começar")).toBe(false);
  });
});

describe("ariaLabelIfLabelInName", () => {
  it("omits mismatched aria-label", () => {
    expect(ariaLabelIfLabelInName("GitHub", "Link ARIA")).toEqual({});
  });

  it("keeps matching or icon-only aria-label", () => {
    expect(ariaLabelIfLabelInName("GitHub", "GitHub profile")).toEqual({ "aria-label": "GitHub profile" });
    expect(ariaLabelIfLabelInName("", "Close")).toEqual({ "aria-label": "Close" });
    expect(ariaLabelIfLabelInName("Ok", "  ")).toEqual({});
  });
});
