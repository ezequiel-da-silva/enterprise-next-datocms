import { beforeEach, describe, expect, it, vi } from "vitest";

vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com");
vi.stubEnv("NEXT_PUBLIC_ORGANIZATION_NAME", "Example Org");

import type { PostDetailRecord } from "@/infra/datocms/types-blog";
import { buildBlogPostJsonLdGraph } from "@/lib/seo/build-blog-post-jsonld";

describe("buildBlogPostJsonLdGraph", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com");
  });

  it("builds BlogPosting and BreadcrumbList", () => {
    const post = {
      id: "1",
      _firstPublishedAt: "2024-01-01T00:00:00Z",
      _updatedAt: "2024-06-15T12:00:00Z",
      postTitle: "My Post",
      postSlug: "my-post",
      postCategory: [{ id: "c1", categoryName: "News", categorySlug: "news", categoryColor: null }],
      postContent: null,
      coverImage: null,
      postAuthor: null,
      seoSettingsSocial: { description: "Summary", title: null, twitterCard: null, noIndex: null, image: null },
      _seoMetaTags: null,
      slugLocales: [{ locale: "en", value: "hello" }],
    } satisfies PostDetailRecord;

    const graph = buildBlogPostJsonLdGraph("en", "my-post", post);

    expect(graph).toHaveLength(2);
    expect(graph[0]["@type"]).toBe("BlogPosting");
    expect(graph[0].url).toBe("https://example.com/en/blog/my-post");
    expect(graph[0].publisher).toEqual({ "@id": "https://example.com/#organization" });
    expect(graph[0].headline).toBe("My Post");
    expect(graph[0].datePublished).toBe("2024-01-01T00:00:00Z");
    expect(graph[0].dateModified).toBe("2024-06-15T12:00:00Z");
    expect(graph[0].inLanguage).toBe("en");
    expect(graph[1]["@type"]).toBe("BreadcrumbList");
  });
});
