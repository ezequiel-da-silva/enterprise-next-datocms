import { describe, expect, it } from "vitest";
import { buildListingPageJsonLd } from "@/lib/seo/build-listing-page-jsonld";
import { homeBreadcrumbLabel } from "@/lib/seo/breadcrumb-labels";

describe("buildListingPageJsonLd", () => {
  it("uses localized home label in breadcrumb schema", () => {
    const graph = buildListingPageJsonLd("pt", "/pt/blog", "Blog");
    const breadcrumb = graph[1] as { itemListElement: { name: string }[] };
    expect(breadcrumb.itemListElement[0]?.name).toBe(homeBreadcrumbLabel("pt"));
    expect(breadcrumb.itemListElement[1]?.name).toBe("Blog");
  });
});
