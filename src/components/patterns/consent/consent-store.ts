"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import {
  CONSENT_CHANGE_EVENT,
  readConsentFromCookieHeader,
  serializeConsentCookie,
  serializeConsentCookieRemoval,
  type ConsentState,
} from "@/lib/consent/consent-cookie";

/** Consent read by the root layout from the request cookie; used as the hydration snapshot. */
export const InitialConsentContext = createContext<ConsentState | null>(null);

let focusBannerOnShow = false;

function subscribe(onChange: () => void): () => void {
  window.addEventListener(CONSENT_CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CONSENT_CHANGE_EVENT, onChange);
}

function readClientConsent(): ConsentState | null {
  return readConsentFromCookieHeader(document.cookie);
}

function isSecureContext(): boolean {
  return window.location.protocol === "https:";
}

export function useConsent(): ConsentState | null {
  const initial = useContext(InitialConsentContext);
  return useSyncExternalStore(subscribe, readClientConsent, () => initial);
}

export function setConsent(state: ConsentState): void {
  document.cookie = serializeConsentCookie(state, isSecureContext());
  window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
}

/** Forgets the choice so the banner shows again; the banner takes focus when it reappears. */
export function clearConsent(): void {
  document.cookie = serializeConsentCookieRemoval(isSecureContext());
  focusBannerOnShow = true;
  window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
}

export function takeBannerFocusRequest(): boolean {
  const requested = focusBannerOnShow;
  focusBannerOnShow = false;
  return requested;
}
