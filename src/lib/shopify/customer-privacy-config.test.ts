import { describe, expect, it } from "vitest";
import {
  readShopifyPrivacyConfig,
  shopifyPrivacyCspHosts,
  toShopifyConsent,
} from "@/lib/shopify/customer-privacy-config";

const BASE = {
  SHOPIFY_STOREFRONT_PUBLIC_TOKEN: " pub-token ",
  SHOPIFY_STORE_DOMAIN: "Shop.myshopify.com",
  NEXT_PUBLIC_SITE_URL: "https://www.example.com/",
};

describe("readShopifyPrivacyConfig", () => {
  it("falls back to the store domain for checkout", () => {
    expect(readShopifyPrivacyConfig(BASE)).toEqual({
      storefrontAccessToken: "pub-token",
      checkoutRootDomain: "shop.myshopify.com",
      storefrontRootDomain: "www.example.com",
    });
  });

  it("prefers the custom checkout domain", () => {
    expect(
      readShopifyPrivacyConfig({ ...BASE, SHOPIFY_CHECKOUT_DOMAIN: "https://checkout.example.com/" })
        ?.checkoutRootDomain,
    ).toBe("checkout.example.com");
  });

  it("is off without the public token or the site URL", () => {
    expect(readShopifyPrivacyConfig({ ...BASE, SHOPIFY_STOREFRONT_PUBLIC_TOKEN: "" })).toBeNull();
    expect(readShopifyPrivacyConfig({ ...BASE, NEXT_PUBLIC_SITE_URL: "not a url" })).toBeNull();
  });
});

describe("shopifyPrivacyCspHosts", () => {
  it("lists store and checkout hosts once", () => {
    expect(shopifyPrivacyCspHosts(BASE)).toEqual(["https://shop.myshopify.com"]);
    expect(shopifyPrivacyCspHosts({ ...BASE, SHOPIFY_CHECKOUT_DOMAIN: "checkout.example.com" })).toEqual([
      "https://shop.myshopify.com",
      "https://checkout.example.com",
    ]);
    expect(shopifyPrivacyCspHosts({})).toEqual([]);
  });
});

describe("toShopifyConsent", () => {
  it("maps the banner choice to every Shopify purpose", () => {
    expect(toShopifyConsent("granted")).toEqual({
      analytics: true,
      marketing: true,
      preferences: true,
      sale_of_data: true,
    });
    expect(Object.values(toShopifyConsent("denied")).every((v) => v === false)).toBe(true);
  });
});
