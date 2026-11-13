import { describe, expect, it } from "vitest";
import { isSearchPageHref, localizeInternalHref } from "./nav-href";

describe("localizeInternalHref", () => {
  it("prefixes locale for CMS slugs", () => {
    expect(localizeInternalHref("/busca", "pt")).toBe("/pt/busca");
    expect(localizeInternalHref("busqueda", "es")).toBe("/es/busqueda");
  });
});

describe("isSearchPageHref", () => {
  it("matches the configured search path", () => {
    expect(isSearchPageHref("/busca", "/es/busqueda", "es")).toBe(false);
    expect(isSearchPageHref("/busqueda", "/es/busqueda", "es")).toBe(true);
    expect(isSearchPageHref("/es/busqueda", "/es/busqueda", "es")).toBe(true);
    expect(isSearchPageHref("/busqueda/", "/es/busqueda", "es")).toBe(true);
  });

  it("ignores external links", () => {
    expect(isSearchPageHref("https://example.com/busca", "/pt/busca", "pt")).toBe(false);
  });
});
