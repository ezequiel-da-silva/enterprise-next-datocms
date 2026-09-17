import { describe, expect, it } from "vitest";
import { recordToWebsitePath, recordToWebsiteRoute } from "@/lib/datocms/record-to-website-route";

describe("recordToWebsiteRoute", () => {
  it("maps PageRecord including home slug", () => {
    expect(recordToWebsiteRoute("PageRecord", "about", "en")).toBe("/en/about");
    expect(recordToWebsiteRoute("PageRecord", "home", "pt")).toBe("/pt");
  });

  it("maps CollectionPageRecord", () => {
    expect(recordToWebsiteRoute("CollectionPageRecord", "hydrogen", "pt")).toBe(
      "/pt/collections/hydrogen",
    );
  });

  it("maps ProductPageRecord", () => {
    expect(recordToWebsiteRoute("ProductPageRecord", "hat", "pt")).toBe("/pt/products/hat");
  });

  it("maps LegalPageRecord", () => {
    expect(recordToWebsiteRoute("LegalPageRecord", "privacy-policy", "pt")).toBe("/pt/privacy-policy");
  });

  it("maps blog entities", () => {
    expect(recordToWebsiteRoute("PostRecord", "post-slug", "en")).toBe("/en/blog/post-slug");
    expect(recordToWebsiteRoute("CategoryRecord", "news", "es")).toBe("/es/blog/category/news");
    expect(recordToWebsiteRoute("AuthorRecord", "maria", "pt")).toBe("/pt/blog/author/maria");
  });

  it("returns null for missing slug", () => {
    expect(recordToWebsiteRoute("PageRecord", "", "en")).toBeNull();
    expect(recordToWebsiteRoute("UnknownRecord", "x", "en")).toBeNull();
  });
});

describe("recordToWebsitePath", () => {
  it("maps redirect records to from_path", () => {
    expect(
      recordToWebsitePath(
        { attributes: { from_path_redirect: "/en/contact" } },
        { attributes: { api_key: "redirect" } },
      ),
    ).toBe("/en/contact");
  });

  it("maps collection_page records", () => {
    expect(
      recordToWebsitePath(
        { attributes: { shopify_handle: "hydrogen" } },
        { attributes: { api_key: "collection_page" } },
        { locale: "en" },
      ),
    ).toBe("/en/collections/hydrogen");
  });

  it("maps product_page records", () => {
    expect(
      recordToWebsitePath(
        { attributes: { shopify_handle: "hat" } },
        { attributes: { api_key: "product_page" } },
        { locale: "en" },
      ),
    ).toBe("/en/products/hat");
  });

  it("maps legal_page records", () => {
    expect(
      recordToWebsitePath(
        { attributes: { slug: "privacy-policy" } },
        { attributes: { api_key: "legal_page" } },
        { locale: "pt_BR" },
      ),
    ).toBe("/pt/privacy-policy");
  });
});
