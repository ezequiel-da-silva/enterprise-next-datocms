import { describe, expect, it } from "vitest";
import { plainTextToShopifyHtml, shopifyHtmlToPlainText } from "@/lib/shopify/product-description-html";

describe("shopifyHtmlToPlainText", () => {
  it("turns paragraph HTML into plain text", () => {
    expect(
      shopifyHtmlToPlainText(
        "<p>Experience the thrill.</p><p>Engineered for versatile performance.</p>",
      ),
    ).toBe("Experience the thrill.\n\nEngineered for versatile performance.");
  });

  it("returns empty for blank HTML", () => {
    expect(shopifyHtmlToPlainText("  ")).toBe("");
    expect(shopifyHtmlToPlainText(null)).toBe("");
  });
});

describe("plainTextToShopifyHtml", () => {
  it("wraps paragraphs and escapes HTML", () => {
    expect(plainTextToShopifyHtml("A & B\n\nC")).toBe("<p>A &amp; B</p><p>C</p>");
  });
});
