import { describe, expect, it } from "vitest";
import { paymentMethodsForLocale } from "@/components/patterns/payment-method-badges";

describe("paymentMethodsForLocale", () => {
  it("includes PIX only for pt", () => {
    expect(paymentMethodsForLocale("pt")).toContain("PIX");
    expect(paymentMethodsForLocale("en")).not.toContain("PIX");
    expect(paymentMethodsForLocale("es")).not.toContain("PIX");
  });
});
