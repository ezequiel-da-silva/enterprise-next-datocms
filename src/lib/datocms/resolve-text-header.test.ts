import { describe, expect, it } from "vitest";
import {
  resolveTextHeader,
  sanitizeSectionId,
  sectionLandmarkProps,
  textHeaderFromRecord,
} from "./resolve-text-header";

describe("resolveTextHeader", () => {
  it("returns empty defaults when the nested block is missing", () => {
    expect(resolveTextHeader(undefined)).toEqual({ title: "", description: "" });
    expect(resolveTextHeader([])).toEqual({ title: "", description: "" });
  });

  it("reads the first modular item and respects has_* toggles", () => {
    expect(
      resolveTextHeader([
        {
          title: "Planos",
          hasDescription: true,
          description: "Escolhe o teu",
          hasSectionId: true,
          sectionId: "Preços!",
        },
      ]),
    ).toEqual({
      title: "Planos",
      description: "Escolhe o teu",
      sectionId: "precos",
    });

    expect(
      resolveTextHeader({
        title: "Hidden copy",
        has_description: false,
        description: "não mostrar",
        has_section_id: false,
        section_id: "ancora",
      }),
    ).toEqual({ title: "Hidden copy", description: "" });
  });

  it("reads textHeaderSection from a parent record", () => {
    expect(
      textHeaderFromRecord({
        textHeaderSection: [{ title: "FAQ", hasDescription: false, hasSectionId: false }],
      }).title,
    ).toBe("FAQ");
  });
});

describe("sectionLandmarkProps", () => {
  it("names the region from the heading when a title exists", () => {
    expect(sectionLandmarkProps({ title: "FAQ", description: "" }, "faq-1", "FAQ")).toEqual({
      "aria-labelledby": "faq-1",
    });
  });

  it("falls back to aria-label when the title is empty", () => {
    expect(
      sectionLandmarkProps({ title: "", description: "Só descrição" }, "faq-1", "FAQ"),
    ).toEqual({ "aria-label": "FAQ" });
  });
});

describe("sanitizeSectionId", () => {
  it("slugifies anchor ids", () => {
    expect(sanitizeSectionId("  Fale Conosco  ")).toBe("fale-conosco");
    expect(sanitizeSectionId("---")).toBeUndefined();
  });
});
