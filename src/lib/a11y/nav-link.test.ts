import { describe, expect, it } from "vitest";
import { navLinkAriaLabel } from "@/lib/a11y/nav-link";

describe("navLinkAriaLabel", () => {
  it("drops CMS aria that fails Label in Name", () => {
    expect(navLinkAriaLabel("en", "Google", { customAria: "Link ARIA" })).toBeUndefined();
  });

  it("keeps custom aria that includes the visible label", () => {
    expect(navLinkAriaLabel("en", "Docs", { customAria: "Docs — external docs" })).toBe(
      "Docs — external docs",
    );
  });

  it("adds new-tab suffix for external links when custom aria is absent", () => {
    expect(navLinkAriaLabel("en", "GitHub", { external: true, newTab: true })).toBe(
      "GitHub (opens in new window)",
    );
  });
});
