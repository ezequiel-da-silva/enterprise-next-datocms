import { describe, expect, it } from "vitest";
import { isSafeExternalHref, resolveLinkBlock } from "@/lib/datocms/link-block";

describe("isSafeExternalHref", () => {
  it("allows https and mailto", () => {
    expect(isSafeExternalHref("https://example.com")).toBe(true);
    expect(isSafeExternalHref("mailto:hi@example.com")).toBe(true);
  });

  it("blocks javascript and protocol-relative URLs", () => {
    expect(isSafeExternalHref("javascript:alert(1)")).toBe(false);
    expect(isSafeExternalHref("//evil.example")).toBe(false);
  });
});

describe("resolveLinkBlock", () => {
  it("resolves internal page link", () => {
    const result = resolveLinkBlock(
      {
        typeContent: "page",
        internalLinkPage: { __typename: "PageRecord", slug: "about" },
      },
      "en",
    );
    expect(result?.kind).toBe("internal");
    if (result?.kind === "internal") {
      expect(result.href).toBe("/en/about");
    }
  });

  it("supports snake_case legacy fields", () => {
    const result = resolveLinkBlock(
      {
        type_content: "post",
        internal_link_post: { __typename: "PostRecord", post_slug: "hello-world" },
      },
      "pt",
    );
    expect(result?.kind).toBe("internal");
    if (result?.kind === "internal") {
      expect(result.href).toBe("/pt/blog/hello-world");
    }
  });

  it("resolves product_page via shopifyHandle", () => {
    const result = resolveLinkBlock(
      {
        typeContent: "product",
        internalLinkProduct: { __typename: "ProductPageRecord", shopifyHandle: "the-complete-snowboard" },
      },
      "en",
    );
    expect(result?.kind).toBe("internal");
    if (result?.kind === "internal") {
      expect(result.href).toBe("/en/products/the-complete-snowboard");
    }
  });

  it("resolves collection_page from snake_case fields", () => {
    const result = resolveLinkBlock(
      {
        type_content: "collection",
        internal_link_collection: { __typename: "CollectionPageRecord", shopify_handle: "hydrogen" },
      },
      "pt",
    );
    expect(result?.kind).toBe("internal");
    if (result?.kind === "internal") {
      expect(result.href).toBe("/pt/collections/hydrogen");
    }
  });

  it("returns null when product handle is missing", () => {
    expect(
      resolveLinkBlock(
        {
          typeContent: "product",
          internalLinkProduct: { __typename: "ProductPageRecord", shopifyHandle: "" },
        },
        "en",
      ),
    ).toBeNull();
  });

  it("blocks unsafe external links", () => {
    const result = resolveLinkBlock(
      {
        typeContent: "external",
        externalLink: "javascript:alert(1)",
      },
      "en",
    );
    expect(result).toBeNull();
  });
});
