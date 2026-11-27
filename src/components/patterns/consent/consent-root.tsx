"use client";

import type { AppLocale } from "@/constants/i18n";
import type { ConsentState } from "@/lib/consent/consent-cookie";
import type { ConsentCopy } from "@/lib/i18n/consent-copy";
import type { ShopifyPrivacyConfig } from "@/lib/shopify/customer-privacy-config";
import { InitialConsentContext } from "./consent-store";
import { CookieConsentBanner } from "./cookie-consent-banner";
import { GoogleAnalytics, type StampGaClientIdAction } from "./google-analytics";
import { SpeedInsightsRoot } from "./speed-insights-root";

type ConsentRootProps = {
  copy: ConsentCopy;
  initialConsent: ConsentState | null;
  gaMeasurementId: string | null;
  speedInsightsEnabled: boolean;
  shopifyPrivacy: ShopifyPrivacyConfig | null;
  privacyPolicyUrl: string | null;
  nonce: string | null;
  locale: AppLocale;
  stampGaClientId: StampGaClientIdAction;
};

export function ConsentRoot({
  copy,
  initialConsent,
  gaMeasurementId,
  speedInsightsEnabled,
  shopifyPrivacy,
  privacyPolicyUrl,
  nonce,
  locale,
  stampGaClientId,
}: ConsentRootProps) {
  return (
    <InitialConsentContext.Provider value={initialConsent}>
      <CookieConsentBanner copy={copy} privacyPolicyUrl={privacyPolicyUrl} shopifyPrivacy={shopifyPrivacy} />
      {gaMeasurementId ? (
        <GoogleAnalytics
          measurementId={gaMeasurementId}
          nonce={nonce}
          locale={locale}
          stampGaClientId={stampGaClientId}
        />
      ) : null}
      {speedInsightsEnabled ? <SpeedInsightsRoot /> : null}
    </InitialConsentContext.Provider>
  );
}
