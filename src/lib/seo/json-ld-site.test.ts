import { describe, expect, it } from "vitest";
import { buildSiteJsonLdGraph } from "@/lib/seo/json-ld-site";

describe("buildSiteJsonLdGraph", () => {
  it("lists every app language on WebSite", () => {
    const graph = buildSiteJsonLdGraph();
    const website = graph.find((node) => node["@type"] === "WebSite");
    expect(website?.inLanguage).toEqual(["en", "pt-BR", "es"]);
    expect(website?.availableLanguage).toEqual(["en", "pt-BR", "es"]);
  });
});
