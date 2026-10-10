import { describe, expect, it, vi } from "vitest";

vi.mock("@/infra/datocms/client", () => ({ datocmsFetch: vi.fn() }));

import { mergeHits, type SearchSiteData } from "./search";

const empty: SearchSiteData = { pages: [], posts: [], authors: [] };

describe("mergeHits — catálogo Shopify", () => {
  it("links products and collections to PDP / PLP paths", () => {
    const hits = mergeHits(
      {
        ...empty,
        products: [{ id: "p1", title: "Snowboard", shopifyHandle: "the-complete-snowboard" }],
        collections: [{ id: "c1", title: "Hydrogen", shopifyHandle: "hydrogen" }],
      },
      "pt",
    );
    expect(hits).toEqual([
      { id: "p1", title: "Snowboard", href: "/pt/products/the-complete-snowboard", kind: "product" },
      { id: "c1", title: "Hydrogen", href: "/pt/collections/hydrogen", kind: "collection" },
    ]);
  });

  it("skips products without a handle", () => {
    const hits = mergeHits(
      {
        ...empty,
        products: [
          { id: "p1", title: "Sem handle", shopifyHandle: null },
          { id: "p2", title: "Vazio", shopifyHandle: "   " },
        ],
      },
      "en",
    );
    expect(hits).toEqual([]);
  });

  it("skips storefront-only collections (frontpage, home-page)", () => {
    const hits = mergeHits(
      {
        ...empty,
        collections: [
          { id: "c1", title: "Home page", shopifyHandle: "frontpage" },
          { id: "c2", title: "Home", shopifyHandle: "Home-Page" },
          { id: "c3", title: "Sale", shopifyHandle: "sale" },
        ],
      },
      "es",
    );
    expect(hits.map((hit) => hit.href)).toEqual(["/es/collections/sale"]);
  });

  it("falls back to the handle when the title is empty and dedupes by href", () => {
    const hits = mergeHits(
      {
        ...empty,
        products: [
          { id: "p1", title: "", shopifyHandle: "board" },
          { id: "p2", title: "Board again", shopifyHandle: "board" },
        ],
      },
      "en",
    );
    expect(hits).toEqual([{ id: "p1", title: "board", href: "/en/products/board", kind: "product" }]);
  });
});
