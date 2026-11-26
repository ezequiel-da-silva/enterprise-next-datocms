import { describe, expect, it } from "vitest";
import {
  isValidGaClientId,
  parseGaClientIdFromGaCookie,
  readGaClientIdCookieFromHeader,
  readGaCookieFromHeader,
  resolveMeasurementProtocolClientId,
  serializeGaClientIdCookie,
  serializeGaClientIdCookieRemoval,
} from "@/lib/analytics/ga-client-id";

describe("ga-client-id", () => {
  it("accepts the GA4 client_id shape", () => {
    expect(isValidGaClientId("123456789.1700000000")).toBe(true);
    expect(isValidGaClientId(" 1.2 ")).toBe(true);
    expect(isValidGaClientId("abc.def")).toBe(false);
    expect(isValidGaClientId("1.2.3")).toBe(false);
    expect(isValidGaClientId("")).toBe(false);
  });

  it("parses client_id from the _ga cookie", () => {
    expect(parseGaClientIdFromGaCookie("GA1.1.123456789.1700000000")).toBe("123456789.1700000000");
    expect(parseGaClientIdFromGaCookie("GA1.2.999.111")).toBe("999.111");
    expect(parseGaClientIdFromGaCookie("broken")).toBeNull();
  });

  it("reads cookies from a document.cookie header", () => {
    expect(readGaCookieFromHeader("theme=dark; _ga=GA1.1.9.8; other=1")).toBe("GA1.1.9.8");
    expect(readGaClientIdCookieFromHeader("nd-ga-cid=9.8; x=1")).toBe("9.8");
    expect(readGaClientIdCookieFromHeader("nd-ga-cid=bad")).toBeNull();
  });

  it("serializes set and clear cookie strings", () => {
    expect(serializeGaClientIdCookie("1.2", true)).toContain("nd-ga-cid=1.2");
    expect(serializeGaClientIdCookie("1.2", true)).toContain("Secure");
    expect(serializeGaClientIdCookieRemoval(false)).toContain("Max-Age=0");
  });

  it("falls back to a UUID-like client_id when preferred is invalid", () => {
    const id = resolveMeasurementProtocolClientId("not-valid");
    expect(id === "not-valid").toBe(false);
    expect(id.length).toBeGreaterThan(0);
    expect(resolveMeasurementProtocolClientId("123.456")).toBe("123.456");
  });
});
