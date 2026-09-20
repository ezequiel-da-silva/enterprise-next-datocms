import { describe, expect, it } from "vitest";
import {
  CONTENT_LISTING_DEFAULTS,
  readBlogPostSelection,
  readContentListingFilterDisplay,
  readContentListingMode,
  readContentListingSource,
  readShopifyProductSelection,
  resolveContentListingOptions,
} from "./resolve-content-listing-section";

describe("readContentListingSource", () => {
  it("defaults missing configurations to blog", () => {
    expect(readContentListingSource({})).toBe("blog");
  });

  it("derives the source from the single block type", () => {
    expect(
      readContentListingSource({
        listingConfig: { __typename: "ShopifyListingConfigRecord", fetchMode: "auto" },
      }),
    ).toBe("shopify");
    expect(
      readContentListingSource({
        listing_config: { __typename: "BlogListingConfigRecord", fetch_mode: "auto" },
      }),
    ).toBe("blog");
  });

  it("keeps compatibility with legacy source and listing_mode fields", () => {
    expect(readContentListingSource({ content_source: "Shopify products" })).toBe("shopify");
    expect(readContentListingSource({ listingMode: "shopify_auto_all" })).toBe("shopify");
    expect(readContentListingSource({ listing_mode: "blog_manual" })).toBe("blog");
  });
});

describe("source-specific selections", () => {
  it("resolves Blog and Shopify nested fetch modes", () => {
    expect(
      resolveContentListingOptions(
        { listingConfig: { __typename: "BlogListingConfigRecord", fetchMode: "manual" } },
        "More",
      ),
    ).toMatchObject({ contentSource: "blog", fetchMode: "manual" });

    expect(
      resolveContentListingOptions(
        { listingConfig: { __typename: "ShopifyListingConfigRecord", fetchMode: "auto" } },
        "More",
      ),
    ).toMatchObject({ contentSource: "shopify", fetchMode: "auto" });
  });

  it("derives compatibility selections from nested configurations", () => {
    expect(
      readBlogPostSelection({
        listingConfig: {
          __typename: "BlogListingConfigRecord",
          fetchMode: "auto",
          filterDisplay: "selected",
        },
      }),
    ).toBe("selected_categories");
    expect(
      readBlogPostSelection({
        listing_config: {
          __typename: "BlogListingConfigRecord",
          fetch_mode: "auto",
          filter_display: "none",
        },
      }),
    ).toBe("no_categories");
    expect(
      readShopifyProductSelection({
        listingConfig: {
          __typename: "ShopifyListingConfigRecord",
          fetchMode: "auto",
          collectionFilter: "selected",
          sourceCollection: { shopifyHandle: "summer" },
        },
      }),
    ).toBe("collection");
    expect(
      readShopifyProductSelection({
        listingConfig: {
          __typename: "ShopifyListingConfigRecord",
          fetchMode: "auto",
          collectionFilter: "all",
          sourceCollection: { shopifyHandle: "summer" },
        },
      }),
    ).toBe("all_products");
    expect(
      readShopifyProductSelection({
        listingConfig: {
          __typename: "ShopifyListingConfigRecord",
          fetchMode: "auto",
          collectionFilter: "selected",
        },
      }),
    ).toBe("collection");
    expect(
      readShopifyProductSelection({
        listingConfig: { __typename: "ShopifyListingConfigRecord", fetchMode: "manual" },
      }),
    ).toBe("manual");
  });

  it("keeps reading the previous selector fields", () => {
    expect(readBlogPostSelection({ blogPostSelection: "selected_categories" })).toBe(
      "selected_categories",
    );
    expect(readShopifyProductSelection({ shopify_product_selection: "manual" })).toBe("manual");
  });

  it.each([
    ["blog_auto_all", "blog", "all_categories", "all_products"],
    ["blog_auto_selected", "blog", "selected_categories", "all_products"],
    ["blog_auto_none", "blog", "no_categories", "all_products"],
    ["blog_manual", "blog", "manual", "all_products"],
    ["shopify_auto_all", "shopify", "all_categories", "all_products"],
    ["shopify_auto_collection", "shopify", "all_categories", "collection"],
    ["shopify_manual", "shopify", "all_categories", "manual"],
  ] as const)(
    "maps legacy mode %s",
    (listingMode, contentSource, blogPostSelection, shopifyProductSelection) => {
      expect(resolveContentListingOptions({ listingMode }, "More")).toMatchObject({
        contentSource,
      });
      expect(readBlogPostSelection({ listingMode })).toBe(blogPostSelection);
      expect(readShopifyProductSelection({ listingMode })).toBe(shopifyProductSelection);
      expect(readContentListingMode({ listingMode })).toBe(listingMode);
    },
  );

  it("maps legacy Shopify collection configuration", () => {
    expect(
      readContentListingMode({
        content_source: "shopify",
        fetch_mode: "auto",
        category_display: "selected",
      }),
    ).toBe("shopify_auto_collection");
  });
});

describe("readContentListingFilterDisplay", () => {
  it("derives Blog filters and Shopify collection scope from the child", () => {
    expect(readContentListingFilterDisplay({})).toBe("all");
    expect(
      readContentListingFilterDisplay({
        listingConfig: {
          __typename: "BlogListingConfigRecord",
          fetchMode: "auto",
          filterDisplay: "selected",
        },
      }),
    ).toBe("selected");
    expect(
      readContentListingFilterDisplay({
        listingConfig: {
          __typename: "BlogListingConfigRecord",
          fetchMode: "auto",
          filterDisplay: "none",
        },
      }),
    ).toBe("none");
    expect(
      readContentListingFilterDisplay({
        listingConfig: {
          __typename: "ShopifyListingConfigRecord",
          fetchMode: "auto",
          collectionFilter: "selected",
          sourceCollection: { shopifyHandle: "summer" },
        },
      }),
    ).toBe("selected");
    expect(
      readContentListingFilterDisplay({
        listingConfig: {
          __typename: "ShopifyListingConfigRecord",
          fetchMode: "auto",
          collectionFilter: "all",
          sourceCollection: { shopifyHandle: "summer" },
        },
      }),
    ).toBe("all");
    expect(
      readContentListingFilterDisplay({
        listingConfig: {
          __typename: "ShopifyListingConfigRecord",
          fetchMode: "auto",
          collection_filter: "selected",
        },
      }),
    ).toBe("selected");
    expect(
      readContentListingFilterDisplay({
        listingConfig: {
          __typename: "ShopifyListingConfigRecord",
          fetchMode: "auto",
          sourceCollection: { shopifyHandle: "summer" },
        },
      }),
    ).toBe("selected");
  });
});
describe("resolveContentListingOptions", () => {
  it("uses shared defaults", () => {
    const shared = {
      contentSource: CONTENT_LISTING_DEFAULTS.contentSource,
      fetchMode: CONTENT_LISTING_DEFAULTS.fetchMode,
      hasLimit: CONTENT_LISTING_DEFAULTS.hasLimit,
      limit: CONTENT_LISTING_DEFAULTS.limit,
      displayType: CONTENT_LISTING_DEFAULTS.displayType,
      initialCount: CONTENT_LISTING_DEFAULTS.initialCount,
      loadMoreStep: CONTENT_LISTING_DEFAULTS.loadMoreStep,
    };
    expect(resolveContentListingOptions({}, "Load more")).toMatchObject({
      ...shared,
      loadMoreLabel: "Load more",
    });
  });

  it("normalizes display labels and clamps shared counts", () => {
    expect(
      resolveContentListingOptions(
        {
          content_source: "blog",
          blog_post_selection: "manual",
          display_type: "Carregar mais",
          limit: 0,
          initial_count: 500,
          load_more_step: 4,
        },
        "Mais",
      ),
    ).toMatchObject({
      fetchMode: "manual",
      displayType: "load_more",
      limit: 1,
      initialCount: 100,
      loadMoreStep: 4,
      loadMoreLabel: "Mais",
    });
  });
});
