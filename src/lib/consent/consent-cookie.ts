/**
 * First-party consent record (`nd-consent`). Not httpOnly: the banner writes it in the browser and
 * the root layout reads it to decide whether to server-render the banner.
 */
export const CONSENT_COOKIE = "nd-consent";
export const CONSENT_CHANGE_EVENT = "nd-consent-change";
export const CONSENT_MAX_AGE_SEC = 60 * 60 * 24 * 180;

export type ConsentState = "granted" | "denied";

const VERSION = "v1";

export function parseConsent(raw: string | null | undefined): ConsentState | null {
  const value = raw?.trim();
  if (value === `${VERSION}:granted`) return "granted";
  if (value === `${VERSION}:denied`) return "denied";
  return null;
}

export function consentCookieValue(state: ConsentState): string {
  return `${VERSION}:${state}`;
}

export function serializeConsentCookie(state: ConsentState, secure: boolean): string {
  return [
    `${CONSENT_COOKIE}=${consentCookieValue(state)}`,
    "Path=/",
    `Max-Age=${CONSENT_MAX_AGE_SEC}`,
    "SameSite=Lax",
    ...(secure ? ["Secure"] : []),
  ].join("; ");
}

export function serializeConsentCookieRemoval(secure: boolean): string {
  return [`${CONSENT_COOKIE}=`, "Path=/", "Max-Age=0", "SameSite=Lax", ...(secure ? ["Secure"] : [])].join("; ");
}

/** Reads `nd-consent` out of a `document.cookie`-style header. */
export function readConsentFromCookieHeader(header: string | null | undefined): ConsentState | null {
  for (const part of (header ?? "").split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === CONSENT_COOKIE) return parseConsent(rest.join("="));
  }
  return null;
}
