import { describe, expect, it } from "vitest";
import { APP_LOCALES } from "@/constants/i18n";
import { ERROR_COPY, errorLocaleFromPath } from "@/lib/i18n/error-copy";

describe("error copy", () => {
  it.each(APP_LOCALES)("has every string in %s", (locale) => {
    const copy = ERROR_COPY[locale];
    expect(copy.title).toBeTruthy();
    expect(copy.description).toBeTruthy();
    expect(copy.retry).toBeTruthy();
  });

  it("uses Brazilian Portuguese, not European", () => {
    expect(ERROR_COPY.pt.title).not.toContain("correu mal");
    expect(ERROR_COPY.pt.title).not.toBe(ERROR_COPY.en.title);
  });

  it("reads the locale from the first path segment", () => {
    expect(errorLocaleFromPath("/es/products/hat")).toBe("es");
    expect(errorLocaleFromPath("/pt")).toBe("pt");
    expect(errorLocaleFromPath("/")).toBe("en");
    expect(errorLocaleFromPath("/xx/page")).toBe("en");
    expect(errorLocaleFromPath(null)).toBe("en");
  });
});
