import { describe, expect, it } from "vitest";
import { readSearchQuery, searchResultsPath } from "@/lib/datocms/search-query";
import { isSearchPageAliasSlug, searchPageLabel, searchPagePath } from "./get-search-page";

describe("searchPagePath", () => {
  it("uses the localized slug from the configured Page", () => {
    expect(
      searchPagePath("en", {
        id: "page-1",
        title: "Search",
        slug: "search",
      }),
    ).toBe("/en/search");
  });

  it("keeps the historical path while Global setting is not configured", () => {
    expect(searchPagePath("pt", null)).toBe("/pt/busca");
    expect(searchPagePath("es", { id: "page-1", title: "Búsqueda", slug: null })).toBe("/es/busca");
  });
});

describe("searchPageLabel", () => {
  it("uses the Page title with a Busca fallback", () => {
    expect(searchPageLabel({ id: "page-1", title: "Find anything", slug: "search" })).toBe(
      "Find anything",
    );
    expect(searchPageLabel(null)).toBe("Busca");
  });
});

describe("isSearchPageAliasSlug", () => {
  it("matches localized search slugs", () => {
    expect(isSearchPageAliasSlug("busca")).toBe(true);
    expect(isSearchPageAliasSlug("Search")).toBe(true);
    expect(isSearchPageAliasSlug("busqueda")).toBe(true);
    expect(isSearchPageAliasSlug("blog")).toBe(false);
  });
});

describe("readSearchQuery", () => {
  it("trims and rejects oversized or multiline values", () => {
    expect(readSearchQuery("  next  ")).toBe("next");
    expect(readSearchQuery("a".repeat(201))).toBe("");
    expect(readSearchQuery("foo\nbar")).toBe("");
  });
});

describe("searchResultsPath", () => {
  it("appends an encoded q when present", () => {
    expect(searchResultsPath("/en/search")).toBe("/en/search");
    expect(searchResultsPath("/en/search", "next js")).toBe("/en/search?q=next%20js");
  });
});
