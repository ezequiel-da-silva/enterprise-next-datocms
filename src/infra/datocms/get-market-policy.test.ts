import { beforeEach, describe, expect, it, vi } from "vitest";

const datocmsFetch = vi.fn();
vi.mock("@/infra/datocms/client", () => ({ datocmsFetch: (...args: unknown[]) => datocmsFetch(...args) }));
vi.mock("@/infra/observability/log-error", () => ({ logWarnThrottled: vi.fn(), logError: vi.fn() }));

import { getMarketPolicy } from "@/infra/datocms/get-market-policy";
import { GET_MARKET_POLICIES } from "@/infra/datocms/market-policy-query";
import { MARKET_POLICY_FIELDS } from "@/lib/seo/merchant-policy";

const BR = {
  country: "BR",
  shippingRate: 0,
  handlingDaysMin: 1,
  handlingDaysMax: 2,
  transitDaysMin: 3,
  transitDaysMax: 7,
  returnDays: 30,
  returnFees: "free",
};

beforeEach(() => {
  datocmsFetch.mockReset();
});

describe("GET_MARKET_POLICIES", () => {
  it("selects every mapped field", () => {
    for (const field of MARKET_POLICY_FIELDS) expect(GET_MARKET_POLICIES).toContain(field);
  });
});

describe("getMarketPolicy", () => {
  it("picks the record of the requested country and normalizes it", async () => {
    datocmsFetch.mockResolvedValue({
      data: { allMarketPolicies: [{ ...BR, country: "US", shippingRate: 9.9 }, BR] },
    });
    expect(await getMarketPolicy("BR")).toMatchObject({ shippingRate: "0.00", returnDays: 30, returnFees: "free" });
    expect(await getMarketPolicy("us")).toMatchObject({ shippingRate: "9.90" });
  });

  it("returns null when the market has no record", async () => {
    datocmsFetch.mockResolvedValue({ data: { allMarketPolicies: [BR] } });
    expect(await getMarketPolicy("ES")).toBeNull();
  });

  it("returns null when the CMS errors or the model does not exist yet", async () => {
    datocmsFetch.mockResolvedValue({ errors: [{ message: "Field 'allMarketPolicies' doesn't exist" }] });
    expect(await getMarketPolicy("BR")).toBeNull();
  });
});
