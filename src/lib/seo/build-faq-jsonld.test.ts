import { describe, expect, it } from "vitest";
import { buildFaqPageJsonLd } from "@/lib/seo/build-faq-jsonld";

describe("buildFaqPageJsonLd", () => {
  it("returns null for empty items", () => {
    expect(buildFaqPageJsonLd([])).toBeNull();
  });

  it("builds FAQPage with Question entities", () => {
    const graph = buildFaqPageJsonLd([
      { id: "1", question: "Q1?", answer: "A1" },
      { id: "2", question: "Q2?", answer: "A2" },
    ]);

    expect(graph?.["@type"]).toBe("FAQPage");
    const entities = graph?.mainEntity as Array<Record<string, unknown>>;
    expect(entities).toHaveLength(2);
    expect(entities[0]?.name).toBe("Q1?");
    expect((entities[0]?.acceptedAnswer as Record<string, unknown>)?.text).toBe("A1");
  });
});
