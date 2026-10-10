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

  it("emits one Offer per variant and the gallery images", () => {
    const money = (amount: string) => ({ amount, currencyCode: "BRL" });
    const graph = buildProductPageJsonLd({
      locale: "pt",
      path: "/pt/products/hat",
      title: "Chapéu",
      catalog: { name: "Produtos", path: "/pt/products" },
      storefront: {
        id: "gid://shopify/Product/1",
        title: "Hat",
        handle: "hat",
        availableForSale: true,
        featuredImage: { url: "https://cdn.shopify.com/a.jpg", altText: null, width: 800, height: 800 },
        images: [
          { url: "https://cdn.shopify.com/a.jpg", altText: null, width: 800, height: 800 },
          { url: "https://cdn.shopify.com/b.jpg", altText: null, width: 800, height: 800 },
        ],
        priceRange: { minVariantPrice: money("19.00") },
        variants: [
          {
            id: "v1",
            title: "M",
            availableForSale: true,
            quantityAvailable: 2,
            price: money("19.00"),
            selectedOptions: [{ name: "Size", value: "M" }],
            image: null,
          },
          {
            id: "v2",
            title: "L",
            availableForSale: false,
            quantityAvailable: 0,
            price: money("21.00"),
            selectedOptions: [{ name: "Size", value: "L" }],
            image: null,
          },
        ],
      },
    });
    const product = graph.find((node) => node["@type"] === "Product");
    expect(product?.image).toEqual(["https://cdn.shopify.com/a.jpg", "https://cdn.shopify.com/b.jpg"]);
    expect(product?.offers).toEqual([
      expect.objectContaining({ name: "M", price: "19.00", availability: "https://schema.org/InStock" }),
      expect.objectContaining({ name: "L", price: "21.00", availability: "https://schema.org/OutOfStock" }),
    ]);
  });
});
