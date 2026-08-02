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
