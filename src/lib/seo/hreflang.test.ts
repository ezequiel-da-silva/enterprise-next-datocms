import { describe, expect, it } from "vitest";
import {
  appLocalesWithSlug,
  buildHreflangAlternates,
  buildHreflangPathsFromSlugLocales,
  buildLocaleAlternatePaths,
} from "@/lib/seo/hreflang";

describe("hreflang", () => {
  it("builds locale paths from a factory", () => {
    expect(buildLocaleAlternatePaths((l) => `/${l}/blog`)).toEqual({
      en: "/en/blog",
      pt: "/pt/blog",
      es: "/es/blog",
    });
  });

  it("builds BCP47 language alternates with x-default", () => {
    const alternates = buildHreflangAlternates({
      en: "/en/about",
      pt: "/pt/about",
      es: "/es/about",
    });
    expect(alternates.languages?.en).toContain("/en/about");
    expect(alternates.languages?.["pt-BR"]).toContain("/pt/about");
    expect(alternates.languages?.["x-default"]).toContain("/en/about");
  });

  it("maps only Dato locales that have a non-empty slug", () => {
    expect(
      appLocalesWithSlug([
        { locale: "en", value: "page-two" },
        { locale: "pt_BR", value: "" },
        { locale: "es", value: null },
      ]),
    ).toEqual(["en"]);
  });

  it("builds hreflang paths only for translated locales (and uses per-locale slug)", () => {
    const paths = buildHreflangPathsFromSlugLocales(
      [
        { locale: "en", value: "page-two" },
        { locale: "pt_BR", value: "pagina-dois" },
      ],
      (l, s) => `/${l}/${s}`,
    );
    expect(paths).toEqual({
      en: "/en/page-two",
      pt: "/pt/pagina-dois",
    });
    expect(paths.es).toBeUndefined();

    const alternates = buildHreflangAlternates(paths);
    expect(alternates.languages?.en).toContain("/en/page-two");
    expect(alternates.languages?.["pt-BR"]).toContain("/pt/pagina-dois");
    expect(alternates.languages?.es).toBeUndefined();
    expect(alternates.languages?.["x-default"]).toContain("/en/page-two");
  });

  it("falls back x-default to the first available locale when en is missing", () => {
    const alternates = buildHreflangAlternates({
      pt: "/pt/sobre",
      es: "/es/sobre",
    });
    expect(alternates.languages?.["x-default"]).toContain("/pt/sobre");
  });
});
