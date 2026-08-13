import { describe, expect, it } from "vitest";
import { claimFromSlot, createFaqSchemaSlot } from "@/lib/seo/faq-schema-slot";

describe("faq schema slot", () => {
  it("allows only the first claim on the same slot", () => {
    const slot = createFaqSchemaSlot();
    expect(claimFromSlot(slot)).toBe(true);
    expect(claimFromSlot(slot)).toBe(false);
  });
});
