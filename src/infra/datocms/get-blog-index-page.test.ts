import { describe, expect, it } from "vitest";
import { blogIndexLabel, blogIndexPath } from "./get-blog-index-page";

describe("blogIndexPath", () => {
  it("uses the localized slug from the configured Page", () => {
    expect(
      blogIndexPath("pt", {
        id: "page-1",
        title: "Notícias",
        slug: "noticias",
      }),
    ).toBe("/pt/noticias");
  });

  it("keeps the historical path while Global setting is not configured", () => {
    expect(blogIndexPath("en", null)).toBe("/en/blog");
    expect(blogIndexPath("es", { id: "page-1", title: "Blog", slug: null })).toBe("/es/blog");
  });
});

describe("blogIndexLabel", () => {
  it("uses the Page title with a Blog fallback", () => {
    expect(blogIndexLabel({ id: "page-1", title: "Journal", slug: "journal" })).toBe("Journal");
    expect(blogIndexLabel(null)).toBe("Blog");
  });
});
