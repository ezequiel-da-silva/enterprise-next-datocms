import { describe, expect, it } from "vitest";
import { isSecretEqual } from "@/lib/security/compare-secret";

describe("isSecretEqual", () => {
  it("matches equal secrets", () => {
    expect(isSecretEqual("preview-secret", "preview-secret")).toBe(true);
  });

  it("rejects mismatch", () => {
    expect(isSecretEqual("wrong", "preview-secret")).toBe(false);
  });

  it("rejects empty values", () => {
    expect(isSecretEqual("", "preview-secret")).toBe(false);
    expect(isSecretEqual(null, "preview-secret")).toBe(false);
  });

  it("rejects different lengths without leaking timing info via throw", () => {
    expect(isSecretEqual("short", "much-longer-secret")).toBe(false);
  });
});
