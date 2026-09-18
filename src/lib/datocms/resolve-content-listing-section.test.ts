import { describe, expect, it } from "vitest";
import {
  CONTENT_LISTING_DEFAULTS,
  readContentListingFilterDisplay,
  readContentListingSource,
  resolveContentListingOptions,
} from "./resolve-content-listing-section";

describe("readContentListingSource", () => {
  it("defaults old blog blocks to blog", () => {
    expect(readContentListingSource({})).toBe("blog");
  });

  it("reads camelCase, snake_case and CMS labels", () => {
    expect(readContentListingSource({ contentSource: "shopify" })).toBe("shopify");
    expect(readContentListingSource({ content_source: "Shopify products" })).toBe("shopify");
    expect(readContentListingSource({ content_source: "Blog" })).toBe("blog");
  });
});

describe("readContentListingFilterDisplay", () => {
  it("defaults to all and reads category_display for collections too", () => {
    expect(readContentListingFilterDisplay({})).toBe("all");
    expect(readContentListingFilterDisplay({ categoryDisplay: "selected" })).toBe("selected");
    expect(readContentListingFilterDisplay({ category_display: "Ocultar filtro" })).toBe("none");
    expect(readContentListingFilterDisplay({ categoryDisplay: "Mostrar todas" })).toBe("all");
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

  it.each([
    ["blog", "auto"],
    ["blog", "manual"],
    ["shopify", "auto"],
    ["shopify", "manual"],
  ] as const)("resolves %s + %s", (contentSource, fetchMode) => {
    expect(resolveContentListingOptions({ contentSource, fetchMode }, "More")).toMatchObject({
      contentSource,
      fetchMode,
    });
  });

  it("normalizes display labels and clamps shared counts", () => {
    expect(
      resolveContentListingOptions(
        {
          fetch_mode: "Seleção manual",
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
