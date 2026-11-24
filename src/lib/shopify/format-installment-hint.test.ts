import { describe, expect, it } from "vitest";
import { formatInstallmentHint } from "@/lib/shopify/format-installment-hint";

describe("formatInstallmentHint", () => {
  it("formats a PT installment line with sem juros when multiplier is 1", () => {
    const hint = formatInstallmentHint("pt", 1000, "BRL", 10, 1);
    expect(hint).toMatch(/10×/);
    expect(hint).toMatch(/100/);
    expect(hint).toMatch(/sem juros/);
  });

  it("omits sem juros when multiplier is above 1", () => {
    const hint = formatInstallmentHint("pt", 1000, "BRL", 10, 1.2);
    expect(hint).toMatch(/10×/);
    expect(hint).not.toMatch(/sem juros/);
  });

  it("applies the multiplier before dividing", () => {
    const hint = formatInstallmentHint("en", 100, "USD", 2, 1.2);
    expect(hint).toContain("2×");
    expect(hint).toMatch(/60/);
    expect(hint).not.toMatch(/interest-free/);
  });

  it("returns null without valid inputs", () => {
    expect(formatInstallmentHint("pt", 100, "BRL", null, 1)).toBeNull();
    expect(formatInstallmentHint("pt", 100, "BRL", 10, null)).toBeNull();
    expect(formatInstallmentHint("pt", 0, "BRL", 10, 1)).toBeNull();
    expect(formatInstallmentHint("pt", 100, "BRL", 1, 1)).toBeNull();
  });
});
