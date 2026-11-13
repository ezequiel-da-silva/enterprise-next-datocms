import { describe, expect, it } from "vitest";
import {
  PRODUCTS_SECTION_DEFAULTS,
  applyProductLimit,
  autoSourceCollectionHandle,
  enrichCatalogProducts,
  hideSoldOutProducts,
  overlayDatoTitles,
  prioritizeAvailableProducts,
  publishedStorefrontProducts,
  readProductPageCards,
  readSourceCollectionHandle,
  resolveProductsSectionOptions,
} from "./resolve-products-section";

describe("resolveProductsSectionOptions", () => {
  it("uses defaults when fields are missing", () => {
    expect(resolveProductsSectionOptions({})).toMatchObject({
      ...PRODUCTS_SECTION_DEFAULTS,
      loadMoreLabel: "Load more products",
    });
  });

  it("reads camelCase and snake_case", () => {
    expect(
      resolveProductsSectionOptions({
        listingConfig: {
          __typename: "ShopifyListingConfigRecord",
          fetchMode: "manual",
        },
        hasLimit: true,
        limit: 9,
        displayType: "carousel",
      }),
    ).toMatchObject({
      fetchMode: "manual",
      hasLimit: true,
      limit: 9,
      displayType: "carousel",
    });

    expect(
      resolveProductsSectionOptions({
        listing_config: {
          __typename: "ShopifyListingConfigRecord",
          fetch_mode: "auto",
        },
        has_limit: true,
        limit: 3,
        display_type: "Carregar mais",
      }),
    ).toMatchObject({
      fetchMode: "auto",
      hasLimit: true,
      limit: 3,
      displayType: "load_more",
    });
  });

  it("normalizes CMS labels and clamps limit", () => {
    expect(
      resolveProductsSectionOptions({
        listingConfig: {
          __typename: "ShopifyListingConfigRecord",
          fetchMode: "manual",
        },
      }).fetchMode,
    ).toBe("manual");
    expect(
      resolveProductsSectionOptions({
        listingConfig: {
          __typename: "ShopifyListingConfigRecord",
          fetchMode: "auto",
          collectionFilter: "selected",
          sourceCollection: { shopifyHandle: "summer" },
        },
      }).filterDisplay,
    ).toBe("selected");
    expect(resolveProductsSectionOptions({ limit: 0 }).limit).toBe(1);
    expect(resolveProductsSectionOptions({ limit: 500 }).limit).toBe(100);
  });

  it("reads the Shopify collection filter from its nested configuration", () => {
    expect(
      resolveProductsSectionOptions({
        listingConfig: {
          __typename: "ShopifyListingConfigRecord",
          fetchMode: "auto",
          collectionFilter: "selected",
          sourceCollection: { shopifyHandle: "summer" },
        },
      }).filterDisplay,
    ).toBe("selected");
    expect(
      resolveProductsSectionOptions({
        listing_config: {
          __typename: "ShopifyListingConfigRecord",
          fetch_mode: "auto",
          collection_filter: "all",
          source_collection: { shopify_handle: "summer" },
        },
      }).filterDisplay,
    ).toBe("all");
    expect(
      resolveProductsSectionOptions({
        listingConfig: {
          __typename: "ShopifyListingConfigRecord",
          fetchMode: "auto",
          collectionFilter: "selected",
        },
      }).filterDisplay,
    ).toBe("selected");
    expect(
      resolveProductsSectionOptions({
        listingConfig: {
          __typename: "ShopifyListingConfigRecord",
          fetchMode: "auto",
          sourceCollection: { shopifyHandle: "summer" },
        },
      }).filterDisplay,
    ).toBe("selected");
    expect(resolveProductsSectionOptions({}).filterDisplay).toBe("all");
  });
});

describe("readProductPageCards", () => {
  it("keeps CMS order and skips rows without handle", () => {
    expect(
      readProductPageCards(
        {
          selectedProducts: [
            { shopifyHandle: "hat", title: "Hat" },
            { shopify_handle: "wax", title: "Wax" },
            { title: "Missing handle" },
          ],
        },
        "selectedProducts",
        "selected_products",
      ),
    ).toEqual([
      { handle: "hat", title: "Hat", badge: null, profile: null, terrain: null, flex: null, baseImage: null },
      { handle: "wax", title: "Wax", badge: null, profile: null, terrain: null, flex: null, baseImage: null },
    ]);
  });
});

describe("readSourceCollectionHandle", () => {
  it("reads a single link or a one-item array", () => {
    expect(readSourceCollectionHandle({ sourceCollection: { shopifyHandle: "hydrogen" } })).toBe("hydrogen");
    expect(readSourceCollectionHandle({ source_collection: [{ shopify_handle: "hydrogen" }] })).toBe("hydrogen");
    expect(readSourceCollectionHandle({})).toBeNull();
  });
});

describe("autoSourceCollectionHandle", () => {
  const record = { sourceCollection: { shopifyHandle: "hydrogen" } };

  it("uses the collection only when category_display is selected", () => {
    expect(autoSourceCollectionHandle(record, "selected")).toBe("hydrogen");
    expect(autoSourceCollectionHandle(record, "all")).toBeNull();
    expect(autoSourceCollectionHandle(record, "none")).toBeNull();
  });

  it("returns empty when selected has no collection", () => {
    expect(autoSourceCollectionHandle({}, "selected")).toBeNull();
  });
});

describe("applyProductLimit", () => {
  const products = [
    { handle: "a", title: "A", availableForSale: true, featuredImage: null, hoverImage: null, badge: null, priceRange: { minVariantPrice: { amount: "1", currencyCode: "USD" } } },
    { handle: "b", title: "B", availableForSale: true, featuredImage: null, hoverImage: null, badge: null, priceRange: { minVariantPrice: { amount: "1", currencyCode: "USD" } } },
    { handle: "c", title: "C", availableForSale: true, featuredImage: null, hoverImage: null, badge: null, priceRange: { minVariantPrice: { amount: "1", currencyCode: "USD" } } },
  ];

  it("does not slice pagination or load_more", () => {
    expect(applyProductLimit(products, true, 1, "pagination")).toHaveLength(3);
    expect(applyProductLimit(products, true, 1, "load_more")).toHaveLength(3);
  });

  it("slices grid when has_limit is on", () => {
    expect(applyProductLimit(products, true, 2, "grid").map((p) => p.handle)).toEqual(["a", "b"]);
    expect(applyProductLimit(products, false, 1, "grid")).toHaveLength(3);
  });
});

describe("hideSoldOutProducts", () => {
  const mixed = [
    {
      handle: "in-stock",
      title: "In stock",
      availableForSale: true,
      featuredImage: null,
      hoverImage: null,
      badge: null,
      priceRange: { minVariantPrice: { amount: "1", currencyCode: "USD" } },
    },
    {
      handle: "sold-out",
      title: "Sold out",
      availableForSale: false,
      featuredImage: null,
      hoverImage: null,
      badge: null,
      priceRange: { minVariantPrice: { amount: "1", currencyCode: "USD" } },
    },
    {
      handle: "also-in-stock",
      title: "Also in stock",
      availableForSale: true,
      featuredImage: null,
      hoverImage: null,
      badge: null,
      priceRange: { minVariantPrice: { amount: "1", currencyCode: "USD" } },
    },
  ];

  it("filters sold-out and keeps available order", () => {
    expect(hideSoldOutProducts(mixed).map((p) => p.handle)).toEqual(["in-stock", "also-in-stock"]);
  });

  it("feeds applyProductLimit without sold-out in the first fold", () => {
    const ranked = hideSoldOutProducts(mixed);
    expect(applyProductLimit(ranked, true, 4, "grid").map((p) => p.handle)).toEqual([
      "in-stock",
      "also-in-stock",
    ]);
  });
});

describe("prioritizeAvailableProducts", () => {
  it("moves sold-out to the end while preserving relative order", () => {
    const mixed = [
      {
        handle: "sold-a",
        title: "A",
        availableForSale: false,
        featuredImage: null,
        hoverImage: null,
        badge: null,
        priceRange: { minVariantPrice: { amount: "1", currencyCode: "USD" } },
      },
      {
        handle: "ok-b",
        title: "B",
        availableForSale: true,
        featuredImage: null,
        hoverImage: null,
        badge: null,
        priceRange: { minVariantPrice: { amount: "1", currencyCode: "USD" } },
      },
      {
        handle: "sold-c",
        title: "C",
        availableForSale: false,
        featuredImage: null,
        hoverImage: null,
        badge: null,
        priceRange: { minVariantPrice: { amount: "1", currencyCode: "USD" } },
      },
      {
        handle: "ok-d",
        title: "D",
        availableForSale: true,
        featuredImage: null,
        hoverImage: null,
        badge: null,
        priceRange: { minVariantPrice: { amount: "1", currencyCode: "USD" } },
      },
    ];
    expect(prioritizeAvailableProducts(mixed).map((p) => p.handle)).toEqual([
      "ok-b",
      "ok-d",
      "sold-a",
      "sold-c",
    ]);
  });
});

describe("overlayDatoTitles", () => {
  it("replaces Storefront titles when a product_page exists", () => {
    const [first] = overlayDatoTitles(
      [
        {
          handle: "hat",
          title: "Hat",
          availableForSale: true,
          featuredImage: null,
          hoverImage: null,
          badge: null,
          priceRange: { minVariantPrice: { amount: "10", currencyCode: "USD" } },
        },
      ],
      [{ handle: "hat", title: "Chapéu", badge: null, profile: null, terrain: null, flex: null, baseImage: null }],
    );
    expect(first?.title).toBe("Chapéu");
  });
});

describe("enrichCatalogProducts", () => {
  it("applies badge and prefers Dato baseImage for hover", () => {
    const galleryHover = {
      url: "https://cdn.shopify.com/gallery.jpg",
      altText: "Gallery",
      width: 600,
      height: 600,
    };
    const baseImage = {
      url: "https://www.datocms-assets.com/base.jpg",
      altText: "Base",
      width: 800,
      height: 800,
    };
    const [first] = enrichCatalogProducts(
      [
        {
          handle: "hydrogen",
          title: "Hydrogen",
          availableForSale: true,
          featuredImage: null,
          hoverImage: galleryHover,
          badge: null,
          priceRange: { minVariantPrice: { amount: "600", currencyCode: "USD" } },
        },
      ],
      [
        {
          handle: "hydrogen",
          title: "Hydrogen CMS",
          badge: "new",
          profile: "camber",
          terrain: "all_mountain",
          flex: 6,
          baseImage,
        },
      ],
    );
    expect(first).toMatchObject({
      title: "Hydrogen CMS",
      badge: "new",
      profile: "camber",
      terrain: "all_mountain",
      flex: 6,
      hoverImage: baseImage,
    });
  });

  it("keeps the Shopify hover image when baseImage is empty", () => {
    const galleryHover = {
      url: "https://cdn.shopify.com/gallery.jpg",
      altText: null,
      width: 600,
      height: 600,
    };
    const [first] = enrichCatalogProducts(
      [
        {
          handle: "oxygen",
          title: "Oxygen",
          availableForSale: true,
          featuredImage: null,
          hoverImage: galleryHover,
          badge: null,
          priceRange: { minVariantPrice: { amount: "1", currencyCode: "USD" } },
        },
      ],
      [
        {
          handle: "oxygen",
          title: "Oxygen",
          badge: null,
          profile: null,
          terrain: null,
          flex: null,
          baseImage: null,
        },
      ],
    );
    expect(first?.hoverImage).toEqual(galleryHover);
    expect(first?.badge).toBeNull();
    expect(first?.profile).toBeNull();
    expect(first?.terrain).toBeNull();
    expect(first?.flex).toBeNull();
  });
});

describe("publishedStorefrontProducts", () => {
  const storefront = [
    {
      handle: "hat",
      title: "Hat",
      availableForSale: true,
      featuredImage: null,
      hoverImage: null,
      badge: null,
      priceRange: { minVariantPrice: { amount: "10", currencyCode: "USD" } },
    },
    {
      handle: "ghost",
      title: "Ghost",
      availableForSale: true,
      featuredImage: null,
      hoverImage: null,
      badge: null,
      priceRange: { minVariantPrice: { amount: "5", currencyCode: "USD" } },
    },
  ];

  it("keeps only handles with a product_page and overlays the Dato title", () => {
    expect(
      publishedStorefrontProducts(storefront, [
        {
          handle: "hat",
          title: "Chapéu",
          badge: null,
          profile: null,
          terrain: null,
          flex: null,
          baseImage: null,
        },
      ]),
    ).toEqual([
      {
        ...storefront[0],
        title: "Chapéu",
        badge: null,
        profile: null,
        terrain: null,
        flex: null,
      },
    ]);
  });

  it("returns empty when there are no product_page records", () => {
    expect(publishedStorefrontProducts(storefront, [])).toEqual([]);
  });
});
