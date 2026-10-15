import { describe, expect, it } from "vitest";

import { LOADING_COPY, loadingLabelFor } from "@/lib/i18n/loading-copy";

describe("loadingLabelFor", () => {
  it("uses the locale of the [slug] segment", () => {
    expect(loadingLabelFor("pt")).toBe(LOADING_COPY.pt);
    expect(loadingLabelFor("es")).toBe(LOADING_COPY.es);
  });

  it("falls back to the default locale for missing or unknown segments", () => {
    expect(loadingLabelFor(undefined)).toBe(LOADING_COPY.en);
    expect(loadingLabelFor("xx")).toBe(LOADING_COPY.en);
  });

  it("reads the first value of a catch-all segment", () => {
    expect(loadingLabelFor(["es", "x"])).toBe(LOADING_COPY.es);
  });
});
