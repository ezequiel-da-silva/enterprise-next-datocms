import { describe, expect, it } from "vitest";
import {
  appLocaleFromPath,
  manifestLang,
  openGraphLocale,
  schemaLanguage,
} from "@/lib/seo/locale-tags";

describe("locale-tags", () => {
  it("maps app locales to Open Graph and schema languages", () => {
    expect(openGraphLocale("en")).toBe("en_US");
    expect(openGraphLocale("pt")).toBe("pt_BR");
    expect(openGraphLocale("es")).toBe("es_ES");
    expect(schemaLanguage("pt")).toBe("pt-BR");
    expect(manifestLang("en")).toBe("en");
  });

  it("derives locale from path segments", () => {
    expect(appLocaleFromPath("/en/page-two")).toBe("en");
    expect(appLocaleFromPath("/pt/blog")).toBe("pt");
    expect(appLocaleFromPath("/contato")).toBe("en");
  });
});
