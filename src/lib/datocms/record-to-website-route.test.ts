import { describe, expect, it } from "vitest";
import { recordToWebsiteRoute } from "@/lib/datocms/record-to-website-route";

describe("recordToWebsiteRoute", () => {
  it("maps PageRecord including home slug", () => {
    expect(recordToWebsiteRoute("PageRecord", "about", "en")).toBe("/en/about");
    expect(recordToWebsiteRoute("PageRecord", "home", "pt")).toBe("/pt");
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
