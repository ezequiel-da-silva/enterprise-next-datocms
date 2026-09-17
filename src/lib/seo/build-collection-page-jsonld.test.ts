import { describe, expect, it } from "vitest";
import { buildCollectionPageJsonLd } from "@/lib/seo/build-collection-page-jsonld";

describe("buildCollectionPageJsonLd", () => {
  it("emits CollectionPage with ItemList of product URLs", () => {
    const graph = buildCollectionPageJsonLd({
      locale: "pt",
      path: "/pt/collections/hydrogen",
      title: "Hydrogen",
      description: "  Boards.  ",
      catalog: { name: "Coleções", path: "/pt/collections" },
      storefront: {
        id: "gid://shopify/Collection/1",
        handle: "hydrogen",
        title: "Hydrogen",
        image: null,
        products: [
          {
            handle: "hat",
            title: "Hat",
            availableForSale: true,
            featuredImage: null,
            priceRange: { minVariantPrice: { amount: "10.00", currencyCode: "BRL" } },
          },
        ],
      },
    });
    const collection = graph.find((node) => node["@type"] === "CollectionPage");
    const webpage = graph.find((node) => node["@type"] === "WebPage");
    expect(collection?.description).toBe("Boards.");
    expect(webpage?.description).toBe("Boards.");
    const main = collection?.mainEntity as { itemListElement?: Array<{ url?: string }> };
    expect(main?.itemListElement?.[0]?.url).toContain("/pt/products/hat");
  });
});
