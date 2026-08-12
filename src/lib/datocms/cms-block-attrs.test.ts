import { describe, expect, it } from "vitest";
import { cmsBlockAttrs } from "@/lib/datocms/cms-block-attrs";

describe("cmsBlockAttrs", () => {
  it("emits typename and id", () => {
    expect(cmsBlockAttrs({ __typename: "HeroSectionRecord", id: "abc" })).toEqual({
      "data-cms-block": "HeroSectionRecord",
      "data-cms-block-id": "abc",
    });
  });

  it("omits empty id and falls back on missing typename", () => {
    expect(cmsBlockAttrs({ id: "  " })).toEqual({ "data-cms-block": "Unknown" });
    expect(cmsBlockAttrs({})).toEqual({ "data-cms-block": "Unknown" });
  });
});
