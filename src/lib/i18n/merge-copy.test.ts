import { describe, expect, it } from "vitest";
import { cleanOverride, interpolate, pickOverrides, pluralTemplate } from "@/lib/i18n/merge-copy";

describe("cleanOverride", () => {
  it("returns trimmed text", () => {
    expect(cleanOverride("  Olá  ")).toBe("Olá");
  });

  it("treats empty, whitespace and non-strings as no override", () => {
    expect(cleanOverride("")).toBeNull();
    expect(cleanOverride("   ")).toBeNull();
    expect(cleanOverride(null)).toBeNull();
    expect(cleanOverride(undefined)).toBeNull();
    expect(cleanOverride(42)).toBeNull();
  });
});

describe("pickOverrides", () => {
  const fields = { title: "cartTitle", empty: "cartEmpty", missing: "cartMissing" } as const;

  it("keeps only non-empty values, keyed by copy key", () => {
    expect(pickOverrides(fields, { cartTitle: " Sacola ", cartEmpty: "  ", other: "x" })).toEqual({
      title: "Sacola",
    });
  });

  it("returns an empty object without a record", () => {
    expect(pickOverrides(fields, null)).toEqual({});
    expect(pickOverrides(fields, undefined)).toEqual({});
  });
});

describe("interpolate", () => {
  it("replaces known placeholders", () => {
    expect(interpolate("Olá, {name}", { name: "Ana" })).toBe("Olá, Ana");
    expect(interpolate("{count} itens ({count})", { count: 3 })).toBe("3 itens (3)");
  });

  it("leaves unknown placeholders visible", () => {
    expect(interpolate("Oi {nome}", { name: "Ana" })).toBe("Oi {nome}");
  });
});

describe("pluralTemplate", () => {
  it("picks singular only for one", () => {
    expect(pluralTemplate("Cart, {count} item", "Cart, {count} items", 1)).toBe("Cart, 1 item");
    expect(pluralTemplate("Cart, {count} item", "Cart, {count} items", 0)).toBe("Cart, 0 items");
    expect(pluralTemplate("Cart, {count} item", "Cart, {count} items", 5)).toBe("Cart, 5 items");
  });
});
