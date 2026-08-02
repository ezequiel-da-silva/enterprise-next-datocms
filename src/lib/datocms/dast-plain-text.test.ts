import { describe, expect, it } from "vitest";
import { dastPlainText } from "@/lib/datocms/dast-plain-text";

describe("dastPlainText", () => {
  it("extracts text from nested paragraph/span DAST", () => {
    const value = {
      schema: "dast",
      document: {
        type: "root",
        children: [
          {
            type: "paragraph",
            children: [{ type: "span", value: "O que é o que é?" }],
          },
        ],
      },
    };
    expect(dastPlainText(value)).toBe("O que é o que é?");
  });

  it("handles plain strings", () => {
    expect(dastPlainText("  hello  ")).toBe("hello");
  });

  it("returns empty for null", () => {
    expect(dastPlainText(null)).toBe("");
  });
});
