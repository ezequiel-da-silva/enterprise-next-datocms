import { describe, expect, it } from "vitest";
import { resolveStructuredTextRecordLink } from "@/lib/datocms/st-record-link";

describe("resolveStructuredTextRecordLink", () => {
  it("resolves PageRecord", () => {
    const result = resolveStructuredTextRecordLink(
      { __typename: "PageRecord", slug: "about", title: "About us" },
      "en",
    );
    expect(result).toEqual({ href: "/en/about", label: "About us" });
  });

  it("resolves LegalPageRecord", () => {
    const result = resolveStructuredTextRecordLink(
      { __typename: "LegalPageRecord", slug: "terms-of-service", title: "Terms" },
      "en",
    );
    expect(result).toEqual({ href: "/en/terms-of-service", label: "Terms" });
  });

  it("resolves ProductPageRecord", () => {
    const result = resolveStructuredTextRecordLink(
      {
        __typename: "ProductPageRecord",
        shopifyHandle: "the-multi-managed-snowboard",
        title: "Snowboard",
      },
      "pt",
    );
    expect(result).toEqual({
      href: "/pt/products/the-multi-managed-snowboard",
      label: "Snowboard",
    });
  });

  it("resolves PostRecord", () => {
    const result = resolveStructuredTextRecordLink(
      { __typename: "PostRecord", postSlug: "hello", postTitle: "Hello" },
      "pt",
    );
    expect(result?.href).toBe("/pt/blog/hello");
    expect(result?.label).toBe("Hello");
  });

  it("returns null when slug is empty", () => {
    expect(resolveStructuredTextRecordLink({ __typename: "PageRecord", slug: "" }, "en")).toBeNull();
  });
});
