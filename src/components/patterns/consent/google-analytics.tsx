"use client";

import Script from "next/script";
import { useEffect } from "react";
import { ConsentScript } from "./consent-script";
import { useConsent } from "./consent-store";

const DENIED = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
} as const;

const GRANTED = {
  ad_storage: "granted",
  ad_user_data: "granted",
  ad_personalization: "granted",
  analytics_storage: "granted",
} as const;

type Gtag = (...args: unknown[]) => void;

function bootstrap(measurementId: string): string {
  return [
    "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}",
    `gtag('consent','default',${JSON.stringify(DENIED)});`,
    `gtag('consent','update',${JSON.stringify(GRANTED)});`,
    "gtag('js',new Date());",
    `gtag('config',${JSON.stringify(measurementId)});`,
  ].join("");
}

/** GA4 (gtag) behind consent. If consent is withdrawn later, Consent Mode is switched back to denied. */
export function GoogleAnalytics({ measurementId, nonce }: { measurementId: string; nonce: string | null }) {
  const consent = useConsent();

  useEffect(() => {
    const gtag = (window as unknown as { gtag?: Gtag }).gtag;
    if (consent !== "granted" && gtag) gtag("consent", "update", DENIED);
  }, [consent]);

  return (
    <ConsentScript>
      <Script
        id="ga4-init"
        nonce={nonce ?? undefined}
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: bootstrap(measurementId) }}
      />
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`}
        nonce={nonce ?? undefined}
        strategy="afterInteractive"
      />
    </ConsentScript>
  );
}
