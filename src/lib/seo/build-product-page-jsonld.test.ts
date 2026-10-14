import { describe, expect, it } from "vitest";
import type { StorefrontProduct, StorefrontVariant } from "@/infra/shopify/storefront";
import { buildProductPageJsonLd } from "@/lib/seo/build-product-page-jsonld";
import { normalizeMarketPolicy } from "@/lib/seo/merchant-policy";

const money = (amount: string) => ({ amount, currencyCode: "BRL" });

function variant(overrides: Partial<StorefrontVariant>): StorefrontVariant {
  return {
    id: "v1",
    title: "M",
    availableForSale: true,
    quantityAvailable: 2,
    price: money("19.00"),
    selectedOptions: [{ name: "Size", value: "M" }],
    image: null,
    sku: null,
    ...overrides,
  };
}

function storefront(overrides: Partial<StorefrontProduct> = {}): StorefrontProduct {
  return {
    id: "gid://shopify/Product/1",
    title: "Hat",
    handle: "hat",
    vendor: null,
    availableForSale: true,
    featuredImage: { url: "https://cdn.shopify.com/a.jpg", altText: null, width: 800, height: 800 },
    images: [
      { url: "https://cdn.shopify.com/a.jpg", altText: null, width: 800, height: 800 },
      { url: "https://cdn.shopify.com/b.jpg", altText: null, width: 800, height: 800 },
    ],
    priceRange: { minVariantPrice: money("19.00") },
    variants: [variant({})],
    ...overrides,
  };
}

const BASE = {
  locale: "pt" as const,
  path: "/pt/products/hat",
  title: "Chapéu",
  catalog: { name: "Produtos", path: "/pt/products" },
  brandName: "Org Name",
  now: new Date("2026-10-13T12:00:00Z"),
};

const POLICY = normalizeMarketPolicy({
  country: "BR",
  shippingRate: 0,
  handlingDaysMin: 1,
  handlingDaysMax: 3,
  transitDaysMin: 3,
  transitDaysMax: 10,
  returnDays: 30,
  returnFees: "free",
});

function productNode(graph: Record<string, unknown>[]) {
  return graph.find((node) => node["@type"] === "Product") as Record<string, unknown>;
}

describe("buildProductPageJsonLd", () => {
  it("puts the product description on Product and WebPage", () => {
    const graph = buildProductPageJsonLd({ ...BASE, description: "  Leve e quente.  ", storefront: null });
    const webpage = graph.find((node) => node["@type"] === "WebPage");
    expect(productNode(graph).description).toBe("Leve e quente.");
    expect(webpage?.description).toBe("Leve e quente.");
  });

  it("emits one Offer per variant with sku and the gallery images", () => {
    const graph = buildProductPageJsonLd({
      ...BASE,
      storefront: storefront({
        variants: [
          variant({ id: "v1", title: "M", sku: "HAT-M" }),
          variant({ id: "v2", title: "L", availableForSale: false, price: money("21.00"), sku: "HAT-L" }),
        ],
      }),
    });
    const product = productNode(graph);
    expect(product.image).toEqual(["https://cdn.shopify.com/a.jpg", "https://cdn.shopify.com/b.jpg"]);
    expect(product.sku).toBeUndefined();
    expect(product.offers).toEqual([
      expect.objectContaining({ name: "M", sku: "HAT-M", price: "19.00", availability: "https://schema.org/InStock" }),
      expect.objectContaining({ name: "L", sku: "HAT-L", price: "21.00", availability: "https://schema.org/OutOfStock" }),
    ]);
  });

  it("puts the sku on Product when there is a single variant", () => {
    const product = productNode(buildProductPageJsonLd({ ...BASE, storefront: storefront({ variants: [variant({ sku: "HAT-1" })] }) }));
    expect(product.sku).toBe("HAT-1");
    expect(product.offers).toMatchObject({ sku: "HAT-1" });
  });

  it("uses the Shopify vendor as brand, falling back to the organization", () => {
    const withVendor = productNode(buildProductPageJsonLd({ ...BASE, storefront: storefront({ vendor: "Acme" }) }));
    expect(withVendor.brand).toEqual({ "@type": "Brand", name: "Acme" });
    const fallback = productNode(buildProductPageJsonLd({ ...BASE, storefront: null }));
    expect(fallback.brand).toEqual({ "@type": "Brand", name: "Org Name" });
  });

  it("sets priceValidUntil one year after now", () => {
    const product = productNode(buildProductPageJsonLd({ ...BASE, storefront: storefront() }));
    expect(product.offers).toMatchObject({ priceValidUntil: "2027-10-13" });
  });

  it("adds shipping and return policy only when the market has a policy", () => {
    const withPolicy = productNode(buildProductPageJsonLd({ ...BASE, policy: POLICY, storefront: storefront() }));
    expect(withPolicy.offers).toMatchObject({
      shippingDetails: {
        shippingRate: { value: "0.00", currency: "BRL" },
        shippingDestination: { addressCountry: "BR" },
      },
      hasMerchantReturnPolicy: { applicableCountry: "BR", merchantReturnDays: 30 },
    });

    const without = productNode(buildProductPageJsonLd({ ...BASE, storefront: storefront() })).offers as Record<
      string,
      unknown
    >;
    expect(without.shippingDetails).toBeUndefined();
    expect(without.hasMerchantReturnPolicy).toBeUndefined();
  });

  it("omits the blocks when the policy values are invalid", () => {
    const offers = productNode(
      buildProductPageJsonLd({
        ...BASE,
        policy: normalizeMarketPolicy({ shippingRate: -5, returnFees: "maybe", returnDays: 30 }),
        storefront: storefront(),
      }),
    ).offers as Record<string, unknown>;
    expect(offers.shippingDetails).toBeUndefined();
    expect(offers.hasMerchantReturnPolicy).toBeUndefined();
  });
});
