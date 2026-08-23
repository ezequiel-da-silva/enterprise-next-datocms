import { describe, expect, it } from "vitest";
import { readCdaBlock, readCdaObject } from "@/lib/datocms/cda-field";

describe("readCdaObject", () => {
  it("reads camelCase and snake_case objects", () => {
    expect(readCdaObject({ ctaButton: { id: "1" } }, "ctaButton", "cta_button")).toEqual({ id: "1" });
    expect(readCdaObject({ cta_button: { id: "2" } }, "ctaButton", "cta_button")).toEqual({ id: "2" });
  });

  it("ignores lists so modular content never leaks as a record", () => {
    expect(readCdaObject({ ctaButton: [{ id: "1" }] }, "ctaButton", "cta_button")).toBeNull();
    expect(readCdaObject({ ctaButton: null }, "ctaButton", "cta_button")).toBeNull();
  });
});

describe("readCdaBlock", () => {
  it("reads a single block field", () => {
    expect(readCdaBlock({ ctaButton: { id: "1" } }, "ctaButton", "cta_button")).toEqual({ id: "1" });
  });

  it("reads the first item of a modular content field", () => {
    expect(readCdaBlock({ ctaButton: [{ id: "1" }, { id: "2" }] }, "ctaButton", "cta_button")).toEqual({ id: "1" });
    expect(readCdaBlock({ cta_button: [{ id: "3" }] }, "ctaButton", "cta_button")).toEqual({ id: "3" });
  });

  it("returns null for empty, nullish or primitive values", () => {
    expect(readCdaBlock({ ctaButton: [] }, "ctaButton", "cta_button")).toBeNull();
    expect(readCdaBlock({ ctaButton: [null] }, "ctaButton", "cta_button")).toBeNull();
    expect(readCdaBlock({ ctaButton: "nope" }, "ctaButton", "cta_button")).toBeNull();
    expect(readCdaBlock({}, "ctaButton", "cta_button")).toBeNull();
  });
});
