import { describe, expect, it } from "vitest";
import {
  buildMarketPolicyTableRows,
  isShippingReturnsPageSlug,
} from "@/lib/seo/market-policy-table";
import { normalizeMarketPolicy } from "@/lib/seo/merchant-policy";

const BR = normalizeMarketPolicy({
  country: "BR",
  shippingRate: 0,
  handlingDaysMin: 1,
  handlingDaysMax: 2,
  transitDaysMin: 3,
  transitDaysMax: 7,
  returnDays: 30,
  returnFees: "free",
});

const US = normalizeMarketPolicy({
  country: "US",
  shippingRate: 9.9,
  handlingDaysMin: 1,
  handlingDaysMax: 2,
  transitDaysMin: 3,
  transitDaysMax: 7,
  returnDays: 30,
  returnFees: "customer",
});

describe("isShippingReturnsPageSlug", () => {
  it("matches the localized CMS slugs only", () => {
    expect(isShippingReturnsPageSlug("en", "shipping-returns")).toBe(true);
    expect(isShippingReturnsPageSlug("pt", "envios-e-devolucoes")).toBe(true);
    expect(isShippingReturnsPageSlug("es", "envios-y-devoluciones")).toBe(true);
    expect(isShippingReturnsPageSlug("pt", "shipping-returns")).toBe(false);
    expect(isShippingReturnsPageSlug("en", "contact")).toBe(false);
  });
});

describe("buildMarketPolicyTableRows", () => {
  it("renders free shipping, day ranges and return terms from the policy", () => {
    const [row] = buildMarketPolicyTableRows("pt", [{ country: "BR", policy: BR }]);
    expect(row).toMatchObject({
      country: "BR",
      shipping: "Grátis",
      handling: "1–2 dias úteis",
      transit: "3–7 dias úteis",
      returns: "Devolução grátis em até 30 dias",
    });
    expect(row?.marketLabel.length).toBeGreaterThan(0);
  });

  it("formats paid shipping in the market currency and states who pays returns", () => {
    const [row] = buildMarketPolicyTableRows("en", [{ country: "US", policy: US }]);
    expect(row?.shipping).toContain("9.90");
    expect(row?.returns).toBe("Returns within 30 days (return shipping paid by customer)");
  });

  it("leaves missing cells empty instead of inventing values and drops empty markets", () => {
    const partial = normalizeMarketPolicy({ country: "ES", shippingRate: null, returnDays: 14 });
    const empty = normalizeMarketPolicy({ country: "ES" });
    const rows = buildMarketPolicyTableRows("es", [
      { country: "ES", policy: partial },
      { country: "BR", policy: empty },
      { country: "US", policy: null },
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      country: "ES",
      shipping: "—",
      handling: "—",
      transit: "—",
      returns: "Devoluciones en 14 días",
    });
  });

  it("collapses equal min/max day ranges", () => {
    const fixed = normalizeMarketPolicy({
      country: "US",
      shippingRate: 5,
      handlingDaysMin: 2,
      transitDaysMin: 4,
    });
    const [row] = buildMarketPolicyTableRows("en", [{ country: "US", policy: fixed }]);
    expect(row).toMatchObject({ handling: "2 business days", transit: "4 business days" });
  });
});
