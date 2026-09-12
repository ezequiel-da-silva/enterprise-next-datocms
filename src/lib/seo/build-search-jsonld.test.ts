import { describe, expect, it } from "vitest";
import { buildSearchPageJsonLd } from "./build-search-jsonld";

describe("buildSearchPageJsonLd", () => {
  it("emits WebPage on the CMS path without a query", () => {
    const graph = buildSearchPageJsonLd({
      locale: "en",
      path: "/en/search",
      title: "Search",
    });
    const page = graph.find((node) => node["@type"] === "WebPage");
    expect(page?.url).toBe("http://localhost:3000/en/search");
    expect(page?.name).toBe("Search");
  });

  it("emits SearchResultsPage with the query in the URL", () => {
    const graph = buildSearchPageJsonLd({
      locale: "pt",
      path: "/pt/busca",
      title: "Busca",
      query: "next",
    });
    const page = graph.find((node) => node["@type"] === "SearchResultsPage");
    expect(page?.url).toBe("http://localhost:3000/pt/busca?q=next");
    expect(page?.name).toBe("Busca: next");
  });
});
