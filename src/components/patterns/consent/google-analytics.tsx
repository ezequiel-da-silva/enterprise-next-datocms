"use client";

import type { AppLocale } from "@/constants/i18n";
import Script from "next/script";
import { useEffect } from "react";
import {
  parseGaClientIdFromGaCookie,
  readGaCookieFromHeader,
  serializeGaClientIdCookie,
  serializeGaClientIdCookieRemoval,
} from "@/lib/analytics/ga-client-id";
import { ConsentScript } from "./consent-script";
import { useConsent } from "./consent-store";

export type StampGaClientIdAction = (locale: AppLocale) => Promise<void>;

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

function isSecureContext(): boolean {
  return typeof window !== "undefined" && window.location.protocol === "https:";
}

function writeGaClientIdCookie(clientId: string): void {
  document.cookie = serializeGaClientIdCookie(clientId, isSecureContext());
}

function clearGaClientIdCookie(): void {
  document.cookie = serializeGaClientIdCookieRemoval(isSecureContext());
}

/** Prefer gtag get; fall back to parsing `_ga` so ATC before the callback still has an id. */
function syncGaClientIdCookie(
  measurementId: string,
  locale: AppLocale,
  stampGaClientId: StampGaClientIdAction,
): void {
  const stamp = () => {
    void stampGaClientId(locale);
  };
  const fromGa = parseGaClientIdFromGaCookie(readGaCookieFromHeader(document.cookie));
  if (fromGa) {
    writeGaClientIdCookie(fromGa);
    stamp();
  }

  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof gtag !== "function") return;
  try {
    gtag("get", measurementId, "client_id", (clientId: string) => {
      const trimmed = typeof clientId === "string" ? clientId.trim() : "";
      if (/^\d+\.\d+$/.test(trimmed)) {
        writeGaClientIdCookie(trimmed);
        stamp();
      }
    });
  } catch {
    /* gtag get may throw if the field API is unavailable — _ga fallback already applied */
  }
}

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
export function GoogleAnalytics({
  measurementId,
  nonce,
  locale,
  stampGaClientId,
}: {
  measurementId: string;
  nonce: string | null;
  locale: AppLocale;
  stampGaClientId: StampGaClientIdAction;
}) {
  const consent = useConsent();

  useEffect(() => {
    const gtag = (window as unknown as { gtag?: Gtag }).gtag;
    if (consent !== "granted") {
      if (gtag) gtag("consent", "update", DENIED);
      clearGaClientIdCookie();
      return;
    }
    syncGaClientIdCookie(measurementId, locale, stampGaClientId);
  }, [consent, measurementId, locale, stampGaClientId]);

  return (
    <ConsentScript>
      <Script
        id="ga4-init"
        nonce={nonce ?? undefined}
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: bootstrap(measurementId) }}
        onLoad={() => {
          if (consent === "granted") syncGaClientIdCookie(measurementId, locale, stampGaClientId);
        }}
      />
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`}
        nonce={nonce ?? undefined}
        strategy="afterInteractive"
        onLoad={() => {
          if (consent === "granted") syncGaClientIdCookie(measurementId, locale, stampGaClientId);
        }}
      />
    </ConsentScript>
  );
}
