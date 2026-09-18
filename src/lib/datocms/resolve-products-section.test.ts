import { describe, expect, it } from "vitest";
import {
  PRODUCTS_SECTION_DEFAULTS,
  applyProductLimit,
  autoSourceCollectionHandle,
  overlayDatoTitles,
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
        fetchMode: "manual",
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
        fetch_mode: "auto",
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
    expect(resolveProductsSectionOptions({ fetchMode: "Curadoria manual" }).fetchMode).toBe("manual");
    expect(resolveProductsSectionOptions({ categoryDisplay: "Apenas selecionadas" }).filterDisplay).toBe(
      "selected",
    );
    expect(resolveProductsSectionOptions({ limit: 0 }).limit).toBe(1);
    expect(resolveProductsSectionOptions({ limit: 500 }).limit).toBe(100);
  });

  it("reads category_display for the Shopify collection filter", () => {
    expect(resolveProductsSectionOptions({ categoryDisplay: "selected" }).filterDisplay).toBe("selected");
    expect(resolveProductsSectionOptions({ category_display: "none" }).filterDisplay).toBe("none");
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
      { handle: "hat", title: "Hat" },
      { handle: "wax", title: "Wax" },
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
    { handle: "a", title: "A", availableForSale: true, featuredImage: null, priceRange: { minVariantPrice: { amount: "1", currencyCode: "USD" } } },
    { handle: "b", title: "B", availableForSale: true, featuredImage: null, priceRange: { minVariantPrice: { amount: "1", currencyCode: "USD" } } },
    { handle: "c", title: "C", availableForSale: true, featuredImage: null, priceRange: { minVariantPrice: { amount: "1", currencyCode: "USD" } } },
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

describe("overlayDatoTitles", () => {
  it("replaces Storefront titles when a product_page exists", () => {
    const [first] = overlayDatoTitles(
      [
        {
          handle: "hat",
          title: "Hat",
          availableForSale: true,
          featuredImage: null,
          priceRange: { minVariantPrice: { amount: "10", currencyCode: "USD" } },
        },
      ],
      [{ handle: "hat", title: "Chapéu" }],
    );
    expect(first?.title).toBe("Chapéu");
  });
});

describe("publishedStorefrontProducts", () => {
  const storefront = [
    {
      handle: "hat",
      title: "Hat",
      availableForSale: true,
      featuredImage: null,
      priceRange: { minVariantPrice: { amount: "10", currencyCode: "USD" } },
    },
    {
      handle: "ghost",
      title: "Ghost",
      availableForSale: true,
      featuredImage: null,
      priceRange: { minVariantPrice: { amount: "5", currencyCode: "USD" } },
    },
  ];

  it("keeps only handles with a product_page and overlays the Dato title", () => {
    expect(publishedStorefrontProducts(storefront, [{ handle: "hat", title: "Chapéu" }])).toEqual([
      { ...storefront[0], title: "Chapéu" },
    ]);
  });

  it("returns empty when there are no product_page records", () => {
    expect(publishedStorefrontProducts(storefront, [])).toEqual([]);
  });
});
