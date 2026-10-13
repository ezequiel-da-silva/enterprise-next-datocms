"use client";

import type { ConsentState } from "@/lib/consent/consent-cookie";
import {
  toShopifyConsent,
  type ShopifyPrivacyConfig,
  type ShopifyTrackingConsent,
} from "@/lib/shopify/customer-privacy-config";

const CONSENT_API_SRC = "https://cdn.shopify.com/shopifycloud/consent-tracking-api/v0.1/consent-tracking-api.js";

type CustomerPrivacy = {
  setTrackingConsent: (
    consent: ShopifyTrackingConsent & {
      headlessStorefront: true;
      checkoutRootDomain: string;
      storefrontRootDomain: string;
      storefrontAccessToken: string;
    },
    callback: (result?: { error?: string }) => void,
  ) => void;
};

declare global {
  interface Window {
    Shopify?: { customerPrivacy?: CustomerPrivacy };
  }
}

let loading: Promise<CustomerPrivacy | null> | null = null;

function loadCustomerPrivacy(): Promise<CustomerPrivacy | null> {
  const existing = window.Shopify?.customerPrivacy;
  if (existing) return Promise.resolve(existing);
  loading ??= new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = CONSENT_API_SRC;
    script.async = true;
    script.onload = () => resolve(window.Shopify?.customerPrivacy ?? null);
    script.onerror = () => {
      loading = null;
      resolve(null);
    };
    document.head.appendChild(script);
  });
  return loading;
}

/** Mirrors the banner choice into Shopify so checkout and Shopify analytics honour it. Never throws. */
export async function syncShopifyConsent(config: ShopifyPrivacyConfig, state: ConsentState): Promise<void> {
  try {
    const api = await loadCustomerPrivacy();
    if (!api) return;
    api.setTrackingConsent({ ...toShopifyConsent(state), headlessStorefront: true, ...config }, (result) => {
      if (result?.error && process.env.NODE_ENV !== "production") {
        console.warn("[consent] Shopify setTrackingConsent:", result.error);
      }
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.warn("[consent] Shopify customer privacy failed", error);
  }
}
