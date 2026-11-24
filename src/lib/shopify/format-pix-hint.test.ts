import { describe, expect, it } from "vitest";
import { formatPixHint } from "@/lib/shopify/format-pix-hint";

describe("formatPixHint", () => {
  it("formats a PT Pix discount line", () => {
    const hint = formatPixHint("pt", 1000, "BRL", 5);
    expect(hint).toMatch(/5% OFF no Pix/);
    expect(hint).toMatch(/950/);
  });

  it("returns null without a valid percent", () => {
    expect(formatPixHint("pt", 1000, "BRL", null)).toBeNull();
    expect(formatPixHint("pt", 1000, "BRL", 0)).toBeNull();
    expect(formatPixHint("pt", 1000, "BRL", 21)).toBeNull();
    expect(formatPixHint("pt", 0, "BRL", 5)).toBeNull();
  });
});
