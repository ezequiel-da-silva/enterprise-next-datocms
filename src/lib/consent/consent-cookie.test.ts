import { describe, expect, it } from "vitest";
import {
  CONSENT_MAX_AGE_SEC,
  parseConsent,
  readConsentFromCookieHeader,
  serializeConsentCookie,
  serializeConsentCookieRemoval,
} from "@/lib/consent/consent-cookie";

describe("consent cookie", () => {
  it("parses only versioned values", () => {
    expect(parseConsent("v1:granted")).toBe("granted");
    expect(parseConsent(" v1:denied ")).toBe("denied");
    expect(parseConsent("granted")).toBeNull();
    expect(parseConsent("v2:granted")).toBeNull();
    expect(parseConsent(undefined)).toBeNull();
  });

  it("serializes with path, max-age and SameSite, Secure only on https", () => {
    expect(serializeConsentCookie("granted", true)).toBe(
      `nd-consent=v1:granted; Path=/; Max-Age=${CONSENT_MAX_AGE_SEC}; SameSite=Lax; Secure`,
    );
    expect(serializeConsentCookie("denied", false)).not.toContain("Secure");
    expect(serializeConsentCookieRemoval(false)).toBe("nd-consent=; Path=/; Max-Age=0; SameSite=Lax");
  });

  it("reads the consent out of a cookie header", () => {
    expect(readConsentFromCookieHeader("theme=dark; nd-consent=v1:denied; nd-cart=x")).toBe("denied");
    expect(readConsentFromCookieHeader("theme=dark")).toBeNull();
    expect(readConsentFromCookieHeader("")).toBeNull();
  });
});
