import { describe, expect, it } from "vitest";
import { APP_LOCALES } from "@/constants/i18n";
import { FEATURE_GRID_COPY } from "@/lib/i18n/feature-grid-copy";

describe("feature grid copy", () => {
  it.each(APP_LOCALES)("has carousel and section labels in %s", (locale) => {
    const copy = FEATURE_GRID_COPY[locale];
    expect(copy.sectionLabel).toBeTruthy();
    expect(copy.roleDescription).toBeTruthy();
    expect(copy.slideRoleDescription).toBeTruthy();
    expect(copy.previous).toBeTruthy();
    expect(copy.next).toBeTruthy();
    expect(copy.pause).toBeTruthy();
    expect(copy.play).toBeTruthy();
    expect(copy.reducedMotion).toBeTruthy();
    expect(copy.slide(2, 5)).toMatch(/2/);
    expect(copy.goTo(3)).toMatch(/3/);
  });
});
