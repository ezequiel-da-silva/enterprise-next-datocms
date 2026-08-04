import { describe, expect, it } from "vitest";
import { buildHreflangAlternates, buildLocaleAlternatePaths } from "@/lib/seo/hreflang";

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
});
