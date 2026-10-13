import { describe, expect, it } from "vitest";
import { APP_LOCALES } from "@/constants/i18n";
import { CONSENT_COPY } from "@/lib/i18n/consent-copy";

describe("consent copy", () => {
  it.each(APP_LOCALES)("has every string in %s", (locale) => {
    for (const value of Object.values(CONSENT_COPY[locale])) expect(value.trim()).toBeTruthy();
  });

  it("keeps the two choices distinct in every locale", () => {
    for (const locale of APP_LOCALES) {
      expect(CONSENT_COPY[locale].acceptAll).not.toBe(CONSENT_COPY[locale].rejectNonEssential);
    }
  });

  it("translates the buttons", () => {
    expect(CONSENT_COPY.pt.acceptAll).toBe("Aceitar todos");
    expect(CONSENT_COPY.es.acceptAll).not.toBe(CONSENT_COPY.en.acceptAll);
  });
});
