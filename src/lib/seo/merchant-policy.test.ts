import { describe, expect, it } from "vitest";
import { returnPolicyFor, shippingDetailsFor } from "@/lib/seo/merchant-policy";

const SHIPPING = {
  SEO_SHIPPING_RATES: "BR:0, US:9.90,ES:5",
  SEO_SHIPPING_HANDLING_DAYS: "1-3",
  SEO_SHIPPING_TRANSIT_DAYS: "3-10",
};

describe("shippingDetailsFor", () => {
  it("builds OfferShippingDetails for the market's country and currency", () => {
    expect(shippingDetailsFor("US", "USD", SHIPPING)).toEqual({
      "@type": "OfferShippingDetails",
      shippingRate: { "@type": "MonetaryAmount", value: "9.90", currency: "USD" },
      shippingDestination: { "@type": "DefinedRegion", addressCountry: "US" },
      deliveryTime: {
        "@type": "ShippingDeliveryTime",
        handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "DAY" },
        transitTime: { "@type": "QuantitativeValue", minValue: 3, maxValue: 10, unitCode: "DAY" },
      },
    });
  });

  it("supports free shipping and a single-day range", () => {
    const details = shippingDetailsFor("BR", "BRL", { ...SHIPPING, SEO_SHIPPING_HANDLING_DAYS: "2" });
    expect(details?.shippingRate).toEqual({ "@type": "MonetaryAmount", value: "0", currency: "BRL" });
    expect((details?.deliveryTime as { handlingTime: unknown }).handlingTime).toMatchObject({ minValue: 2, maxValue: 2 });
  });

  it("omits the block when the market or the env is missing or invalid", () => {
    expect(shippingDetailsFor("MX", "MXN", SHIPPING)).toBeNull();
    expect(shippingDetailsFor("BR", "BRL", {})).toBeNull();
    expect(shippingDetailsFor("BR", "BRL", { ...SHIPPING, SEO_SHIPPING_RATES: "BR:abc" })).toBeNull();
    expect(shippingDetailsFor("BR", "BRL", { ...SHIPPING, SEO_SHIPPING_TRANSIT_DAYS: "10-3" })).toBeNull();
    expect(shippingDetailsFor("BR", "BRL", { ...SHIPPING, SEO_SHIPPING_HANDLING_DAYS: undefined })).toBeNull();
  });
});

describe("returnPolicyFor", () => {
  it("builds a finite-window MerchantReturnPolicy", () => {
    expect(returnPolicyFor("BR", { SEO_RETURN_DAYS: "30", SEO_RETURN_FEES: "free" })).toEqual({
      "@type": "MerchantReturnPolicy",
      applicableCountry: "BR",
      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 30,
      returnMethod: "https://schema.org/ReturnByMail",
      returnFees: "https://schema.org/FreeReturn",
    });
    expect(returnPolicyFor("US", { SEO_RETURN_DAYS: "7", SEO_RETURN_FEES: "Customer" })?.returnFees).toBe(
      "https://schema.org/ReturnFeesCustomerResponsibility",
    );
  });

  it("omits the policy with missing or invalid env", () => {
    expect(returnPolicyFor("BR", {})).toBeNull();
    expect(returnPolicyFor("BR", { SEO_RETURN_DAYS: "30", SEO_RETURN_FEES: "maybe" })).toBeNull();
    expect(returnPolicyFor("BR", { SEO_RETURN_DAYS: "0", SEO_RETURN_FEES: "free" })).toBeNull();
    expect(returnPolicyFor("BR", { SEO_RETURN_DAYS: "thirty", SEO_RETURN_FEES: "free" })).toBeNull();
  });
});
