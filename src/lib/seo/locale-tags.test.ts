import { describe, expect, it } from "vitest";
import {
  appLocaleFromPath,
  localeSwitcherTriggerLabel,
  manifestLang,
  openGraphAlternateLocales,
  openGraphLocale,
  schemaLanguage,
  schemaLanguages,
} from "@/lib/seo/locale-tags";

describe("locale-tags", () => {
  it("maps app locales to Open Graph and schema languages", () => {
    expect(openGraphLocale("en")).toBe("en_US");
    expect(openGraphLocale("pt")).toBe("pt_BR");
    expect(openGraphLocale("es")).toBe("es_ES");
    expect(schemaLanguage("pt")).toBe("pt-BR");
    expect(schemaLanguages()).toEqual(["en", "pt-BR", "es"]);
    expect(manifestLang("en")).toBe("en");
    expect(localeSwitcherTriggerLabel("en", "EN")).toBe("Language: EN");
    expect(localeSwitcherTriggerLabel("pt", "PT")).toBe("Idioma: PT");
  });

  it("builds og:locale:alternate only for hreflang locales other than current", () => {
    expect(openGraphAlternateLocales("en")).toBeUndefined();
    expect(
      openGraphAlternateLocales("en", {
        en: "/en/page-two",
        pt: "/pt/pagina-dois",
      }),
    ).toEqual(["pt_BR"]);
  });

  it("derives locale from path segments", () => {
    expect(appLocaleFromPath("/en/page-two")).toBe("en");
    expect(appLocaleFromPath("/pt/blog")).toBe("pt");
    expect(appLocaleFromPath("/contato")).toBe("en");
  });
});
