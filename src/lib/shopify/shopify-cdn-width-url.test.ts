import { describe, expect, it } from "vitest";
import { shopifyCdnWidthUrl } from "@/lib/datocms-image-loader";

describe("shopifyCdnWidthUrl", () => {
  it("sets width on cdn.shopify.com URLs", () => {
    expect(shopifyCdnWidthUrl("https://cdn.shopify.com/s/files/1/hat.jpg", 1600)).toBe(
      "https://cdn.shopify.com/s/files/1/hat.jpg?width=1600",
    );
  });

  it("rejects non-Shopify hosts", () => {
    expect(shopifyCdnWidthUrl("https://evil.example/cdn.shopify.com/x.jpg", 800)).toBeNull();
    expect(shopifyCdnWidthUrl("https://www.datocms-assets.com/a.jpg", 800)).toBeNull();
  });
});
