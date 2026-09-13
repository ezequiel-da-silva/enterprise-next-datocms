import { describe, expect, it } from "vitest";
import { structuredTextHasHeadingLevel } from "@/lib/datocms/structured-text-has-heading";

describe("structuredTextHasHeadingLevel", () => {
  it("detects an h1 in DAST", () => {
    expect(
      structuredTextHasHeadingLevel(
        {
          value: {
            type: "root",
            children: [{ type: "heading", level: 1, children: [{ type: "span", value: "Privacy" }] }],
          },
        },
        1,
      ),
    ).toBe(true);
  });

  it("detects an h1 inside a Dato DAST document wrapper", () => {
    expect(
      structuredTextHasHeadingLevel(
        {
          value: {
            schema: "dast",
            document: {
              type: "root",
              children: [{ type: "heading", level: 1, children: [{ type: "span", value: "Privacy" }] }],
            },
          },
        },
        1,
      ),
    ).toBe(true);
  });

  it("returns false when only h2 exists", () => {
    expect(
      structuredTextHasHeadingLevel(
        {
          value: {
            type: "root",
            children: [{ type: "heading", level: 2, children: [{ type: "span", value: "Scope" }] }],
          },
        },
        1,
      ),
    ).toBe(false);
  });
});
