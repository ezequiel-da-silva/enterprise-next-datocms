import { describe, expect, it } from "vitest";
import { CHROME_COPY } from "@/lib/i18n/chrome-copy";
import { formatAnnouncementStrip, formatFooterMarketSummary } from "@/lib/seo/format-announcement-strip";
import type { MarketPolicy } from "@/lib/seo/merchant-policy";

const base: MarketPolicy = {
  shippingRate: "9.90",
  freeShippingThreshold: null,
  handling: { min: 1, max: 2 },
  transit: { min: 3, max: 5 },
  returnDays: 30,
  returnFees: "free",
};

describe("formatAnnouncementStrip", () => {
  it("returns null without policy", () => {
    expect(formatAnnouncementStrip("en", null, "USD", CHROME_COPY.en)).toBeNull();
  });

  it("prefers free-shipping threshold", () => {
    const text = formatAnnouncementStrip(
      "en",
      { ...base, freeShippingThreshold: 199 },
      "USD",
      CHROME_COPY.en,
    );
    expect(text).toMatch(/199/);
    expect(text?.toLowerCase()).toContain("free shipping");
  });

  it("uses flat free shipping when rate is 0", () => {
    expect(
      formatAnnouncementStrip("pt", { ...base, shippingRate: "0.00" }, "BRL", CHROME_COPY.pt),
    ).toBe(CHROME_COPY.pt.announcementFreeShippingFlat);
  });

  it("falls back to returns copy", () => {
    expect(
      formatAnnouncementStrip(
        "en",
        { ...base, shippingRate: "9.90", freeShippingThreshold: null, returnDays: 14 },
        "USD",
        CHROME_COPY.en,
      ),
    ).toContain("14");
  });
});

describe("formatFooterMarketSummary", () => {
  it("includes country and currency", () => {
    expect(formatFooterMarketSummary("en", "US", "USD", base, CHROME_COPY.en)).toContain("US · USD");
  });
});
