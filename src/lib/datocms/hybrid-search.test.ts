import { describe, expect, it } from "vitest";
import { buildPreviewSearchPayload } from "@/lib/datocms/hybrid-search";
import type { SearchHit } from "@/lib/datocms/search-hit";

const product = (id: string): SearchHit => ({
  id,
  title: id,
  href: `/en/products/${id}`,
  kind: "product",
  product: {
    handle: id,
    title: id,
    availableForSale: true,
    featuredImage: null,
    hoverImage: null,
    badge: null,
    priceRange: { minVariantPrice: { amount: "1", currencyCode: "USD" } },
    compareAtPrice: null,
    sizes: [],
  },
});

const page = (id: string): SearchHit => ({
  id,
  title: id,
  href: `/en/${id}`,
  kind: "page",
});

describe("buildPreviewSearchPayload", () => {
  it("puts products first and caps at 4 products + 3 editorial", () => {
    const payload = buildPreviewSearchPayload({
      products: [product("a"), product("b"), product("c"), product("d"), product("e")],
      editorial: [page("p1"), page("p2"), page("p3"), page("p4")],
    });
    expect(payload.hits.map((h) => h.id)).toEqual(["a", "b", "c", "d", "p1", "p2", "p3"]);
    expect(payload.error).toBeUndefined();
  });

  it("keeps editorial when Shopify fails", () => {
    const payload = buildPreviewSearchPayload({
      products: [],
      editorial: [page("guide")],
      productsFailed: true,
      productsError: "timeout",
    });
    expect(payload.hits).toHaveLength(1);
    expect(payload.error).toBeUndefined();
  });

  it("sets error only when both sides fail with no hits", () => {
    expect(
      buildPreviewSearchPayload({
        products: [],
        editorial: [],
        productsFailed: true,
        editorialFailed: true,
        productsError: "sf",
        editorialError: "dato",
      }),
    ).toEqual({ hits: [], error: "sf" });
  });
});
