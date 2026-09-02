import { describe, expect, it } from "vitest";
import { excerptPlainText, postListingJsonLdItem, readPostExcerpt } from "@/lib/blog/excerpt";

describe("readPostExcerpt", () => {
  it("reads camelCase excerpt", () => {
    expect(readPostExcerpt({ excerpt: "  Hello world  " })).toBe("Hello world");
  });

  it("returns empty when missing", () => {
    expect(readPostExcerpt({})).toBe("");
  });
});

describe("excerptPlainText", () => {
  it("collapses newlines from the CMS textarea", () => {
    expect(excerptPlainText("One sentence.\n\nSecond.")).toBe("One sentence. Second.");
  });

  it("returns empty for blank values", () => {
    expect(excerptPlainText("  \n  ")).toBe("");
    expect(excerptPlainText(null)).toBe("");
  });
});

describe("postListingJsonLdItem", () => {
  it("includes description from excerpt when present", () => {
    expect(
      postListingJsonLdItem({ postTitle: "Hello", postSlug: "hello", excerpt: "Teaser\nhere" }, "en"),
    ).toEqual({
      name: "Hello",
      path: "/en/blog/hello",
      description: "Teaser here",
    });
  });

  it("omits description when excerpt is empty", () => {
    expect(postListingJsonLdItem({ postTitle: "Hello", postSlug: "hello" }, "pt")).toEqual({
      name: "Hello",
      path: "/pt/blog/hello",
    });
  });
});
