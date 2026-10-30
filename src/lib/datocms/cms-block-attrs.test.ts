import { describe, expect, it } from "vitest";
import { cmsBlockAttrs, cmsRecordAttrs } from "@/lib/datocms/cms-block-attrs";

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

describe("cmsRecordAttrs", () => {
  it("emits typename and id", () => {
    expect(cmsRecordAttrs({ __typename: "AuthorRecord", id: "auth_123" })).toEqual({
      "data-cms-record": "AuthorRecord",
      "data-cms-record-id": "auth_123",
    });
  });

  it("omits empty id and falls back on missing typename", () => {
    expect(cmsRecordAttrs({ id: "  " })).toEqual({ "data-cms-record": "Unknown" });
    expect(cmsRecordAttrs({})).toEqual({ "data-cms-record": "Unknown" });
  });
});
