import { describe, expect, it } from "vitest";
import { APP_LOCALES } from "@/constants/i18n";
import { themeCopy } from "@/lib/i18n/theme-copy";

describe("theme copy", () => {
  it.each(APP_LOCALES)("has light and dark labels in %s", (locale) => {
    const copy = themeCopy(locale);
    expect(copy.activateLight).toBeTruthy();
    expect(copy.activateDark).toBeTruthy();
  });

  it("uses English on English locales", () => {
    expect(themeCopy("en").activateDark).toMatch(/dark/i);
  });
});
