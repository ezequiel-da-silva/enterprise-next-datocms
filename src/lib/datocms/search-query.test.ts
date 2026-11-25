import { describe, expect, it } from "vitest";
import { isSearchResultsPath, readSearchQuery, searchResultsPath } from "./search-query";

describe("readSearchQuery", () => {
  it("trims and accepts a short term", () => {
    expect(readSearchQuery("  snow  ")).toBe("snow");
  });

  it("rejects empty, oversized, or multiline input", () => {
    expect(readSearchQuery("")).toBe("");
    expect(readSearchQuery("a".repeat(201))).toBe("");
    expect(readSearchQuery("a\nb")).toBe("");
  });
});

describe("searchResultsPath", () => {
  it("appends encoded q when present", () => {
    expect(searchResultsPath("/en/search", "snow board")).toBe(
      "/en/search?q=snow%20board",
    );
  });

  it("returns the path alone when q is empty", () => {
    expect(searchResultsPath("/pt/busca", "  ")).toBe("/pt/busca");
  });
});

describe("isSearchResultsPath", () => {
  it("matches equal paths ignoring trailing slash and query", () => {
    expect(isSearchResultsPath("/en/search", "/en/search")).toBe(true);
    expect(isSearchResultsPath("/en/search/", "/en/search")).toBe(true);
    expect(isSearchResultsPath("/en/search?q=snow", "/en/search")).toBe(true);
  });

  it("rejects different locale or slug", () => {
    expect(isSearchResultsPath("/pt/busca", "/en/search")).toBe(false);
    expect(isSearchResultsPath("/en/shop", "/en/search")).toBe(false);
  });
});
