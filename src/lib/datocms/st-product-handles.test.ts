import { describe, expect, it } from "vitest";
import { collectStructuredTextProductHandles } from "@/lib/datocms/st-product-handles";

describe("collectStructuredTextProductHandles", () => {
  it("returns an empty list without links", () => {
    expect(collectStructuredTextProductHandles(null)).toEqual([]);
    expect(collectStructuredTextProductHandles({})).toEqual([]);
    expect(collectStructuredTextProductHandles({ links: ["id-1", "id-2"] })).toEqual([]);
  });

  it("collects unique ProductPageRecord handles and ignores other records", () => {
    expect(
      collectStructuredTextProductHandles({
        links: [
          { __typename: "ProductPageRecord", id: "1", shopifyHandle: " hydrogen " },
          { __typename: "ProductPageRecord", id: "2", shopifyHandle: "hydrogen" },
          { __typename: "ProductPageRecord", id: "3", shopifyHandle: "" },
          { __typename: "ProductPageRecord", id: "4", shopifyHandle: null },
          { __typename: "PageRecord", id: "5", slug: "about" },
          { __typename: "ProductPageRecord", id: "6", shopifyHandle: "liquid" },
        ],
      }),
    ).toEqual(["hydrogen", "liquid"]);
  });
});
