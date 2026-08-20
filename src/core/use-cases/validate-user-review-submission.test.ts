import { describe, expect, it } from "vitest";
import { validateUserReviewSubmission } from "./validate-user-review-submission";

const validInput = {
  authorName: "Maria Silva",
  authorEmail: "maria@example.com",
  rating: "5",
  comment: "Uma experiência excelente e muito bem conduzida.",
};

describe("validateUserReviewSubmission", () => {
  it("accepts FormData-like rating strings and normalizes them", () => {
    const result = validateUserReviewSubmission(validInput);
    expect(result).toEqual({
      ok: true,
      data: {
        ...validInput,
        rating: 5,
      },
    });
  });

  it.each([0, 6, 1.5])("rejects rating %s outside the integer 1–5 range", (rating) => {
    const result = validateUserReviewSubmission({ ...validInput, rating });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fieldErrors.rating).toBeDefined();
  });

  it("rejects invalid identity and short comments", () => {
    const result = validateUserReviewSubmission({
      ...validInput,
      authorName: "A",
      authorEmail: "invalid",
      comment: "Curto",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors).toMatchObject({
        authorName: expect.any(String),
        authorEmail: expect.any(String),
        comment: expect.any(String),
      });
    }
  });

  it("rejects values above the configured limits", () => {
    const result = validateUserReviewSubmission({
      ...validInput,
      authorName: "A".repeat(101),
      authorEmail: `${"a".repeat(250)}@example.com`,
      comment: "A".repeat(1001),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors.authorName).toContain("100");
      expect(result.fieldErrors.authorEmail).toBeDefined();
      expect(result.fieldErrors.comment).toContain("1000");
    }
  });
});
