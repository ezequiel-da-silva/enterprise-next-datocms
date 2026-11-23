import { describe, expect, it } from "vitest";
import { formatInstallmentHint } from "@/lib/shopify/format-installment-hint";

describe("formatInstallmentHint", () => {
  it("formats a PT installment line", () => {
    const hint = formatInstallmentHint("pt", 1000, "BRL", 10, 1);
    expect(hint).toMatch(/10×/);
    expect(hint).toMatch(/100/);
  });

  it("applies the multiplier before dividing", () => {
    const hint = formatInstallmentHint("en", 100, "USD", 2, 1.2);
    expect(hint).toContain("2×");
    expect(hint).toMatch(/60/);
  });

  it("returns null without valid inputs", () => {
    expect(formatInstallmentHint("pt", 100, "BRL", null, 1)).toBeNull();
    expect(formatInstallmentHint("pt", 100, "BRL", 10, null)).toBeNull();
    expect(formatInstallmentHint("pt", 0, "BRL", 10, 1)).toBeNull();
    expect(formatInstallmentHint("pt", 100, "BRL", 1, 1)).toBeNull();
  });
});
