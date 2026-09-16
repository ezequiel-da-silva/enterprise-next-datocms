import { describe, expect, it } from "vitest";
import { buildProductPageJsonLd } from "@/lib/seo/build-product-page-jsonld";

describe("buildProductPageJsonLd", () => {
  it("puts the product description on Product and WebPage", () => {
    const graph = buildProductPageJsonLd({
      locale: "pt",
      path: "/pt/products/hat",
      title: "Chapéu",
      description: "  Leve e quente.  ",
      catalog: { name: "Produtos", path: "/pt/products" },
      storefront: null,
    });
    const product = graph.find((node) => node["@type"] === "Product");
    const webpage = graph.find((node) => node["@type"] === "WebPage");
    expect(product?.description).toBe("Leve e quente.");
    expect(webpage?.description).toBe("Leve e quente.");
  });
});
