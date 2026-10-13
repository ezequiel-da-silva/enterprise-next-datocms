"use client";

import { SpeedInsights } from "@vercel/speed-insights/next";
import { readConsentFromCookieHeader } from "@/lib/consent/consent-cookie";
import { ConsentScript } from "./consent-script";

/**
 * Re-reads the consent cookie when each event is sent: an injected script cannot be unloaded, so
 * after a withdrawal this is what stops further vitals until the next navigation.
 */
function dropWithoutConsent<T>(event: T): T | null {
  return readConsentFromCookieHeader(document.cookie) === "granted" ? event : null;
}

/** Real-user Web Vitals; mounted only after "Accept all". */
export function SpeedInsightsRoot() {
  return (
    <ConsentScript>
      <SpeedInsights beforeSend={dropWithoutConsent} />
    </ConsentScript>
  );
}
