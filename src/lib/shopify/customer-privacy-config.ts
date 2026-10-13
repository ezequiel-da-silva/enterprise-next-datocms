import type { ConsentState } from "@/lib/consent/consent-cookie";
import { normalizeShopDomain } from "@/lib/shopify/parse-product-webhook";

type Env = Record<string, string | undefined>;

/**
 * Browser-side config for the Shopify Customer Privacy API. `SHOPIFY_STOREFRONT_PUBLIC_TOKEN` is a
 * public Storefront token (Headless channel) and is the only Shopify token allowed in the browser —
 * never reuse `SHOPIFY_STOREFRONT_ACCESS_TOKEN` here.
 */
export type ShopifyPrivacyConfig = {
  storefrontAccessToken: string;
  checkoutRootDomain: string;
  storefrontRootDomain: string;
};

export type ShopifyTrackingConsent = {
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  sale_of_data: boolean;
};

function hostOf(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function readShopifyPrivacyConfig(env: Env = process.env): ShopifyPrivacyConfig | null {
  const token = env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN?.trim();
  const checkout = normalizeShopDomain(env.SHOPIFY_CHECKOUT_DOMAIN) || normalizeShopDomain(env.SHOPIFY_STORE_DOMAIN);
  const storefront = hostOf(env.NEXT_PUBLIC_SITE_URL);
  if (!token || !checkout || !storefront) return null;
  return { storefrontAccessToken: token, checkoutRootDomain: checkout, storefrontRootDomain: storefront };
}

/** Hosts the consent API talks to; added to `connect-src` only when the config is complete. */
export function shopifyPrivacyCspHosts(env: Env = process.env): string[] {
  const config = readShopifyPrivacyConfig(env);
  if (!config) return [];
  const store = normalizeShopDomain(env.SHOPIFY_STORE_DOMAIN);
  return [...new Set([store, config.checkoutRootDomain].filter(Boolean))].map((host) => `https://${host}`);
}

export function toShopifyConsent(state: ConsentState): ShopifyTrackingConsent {
  const granted = state === "granted";
  return { analytics: granted, marketing: granted, preferences: granted, sale_of_data: granted };
}
