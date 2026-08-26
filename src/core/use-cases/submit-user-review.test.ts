import { describe, expect, it, vi } from "vitest";
import type { UserReviewCreator } from "@/core/ports/user-review-creator";
import { submitUserReviewUseCase } from "@/core/use-cases/submit-user-review";

describe("submitUserReviewUseCase", () => {
  it("returns field errors for invalid input", async () => {
    const create = vi.fn<UserReviewCreator>();
    const result = await submitUserReviewUseCase(
      { authorName: "A", authorEmail: "bad", rating: 0, comment: "x" },
      "pt",
      create,
    );
    expect(result.ok).toBe(false);
    expect(create).not.toHaveBeenCalled();
  });

  it("creates a pending review for valid input", async () => {
    const create = vi.fn<UserReviewCreator>(async () => ({ ok: true }));
    const result = await submitUserReviewUseCase(
      {
        authorName: "Maria Silva",
        authorEmail: "maria@example.com",
        rating: 5,
        comment: "Excelente experiência com o produto.",
      },
      "en",
      create,
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.statusCode).toBe("submitted");
    }
    expect(create).toHaveBeenCalledWith({
      authorName: "Maria Silva",
      authorEmail: "maria@example.com",
      rating: 5,
      comment: "Excelente experiência com o produto.",
      locale: "en",
    });
  });

  it("surfaces transport errors", async () => {
    const create = vi.fn<UserReviewCreator>(async () => ({
      ok: false,
      reason: "transport_error",
    }));
    const result = await submitUserReviewUseCase(
      {
        authorName: "Maria Silva",
        authorEmail: "maria@example.com",
        rating: 4,
        comment: "Muito bom, recomendo a todos.",
      },
      "pt",
      create,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.statusCode).toBe("transportError");
    }
  });

  it("surfaces missing CMA token as not configured", async () => {
    const create = vi.fn<UserReviewCreator>(async () => ({
      ok: false,
      reason: "not_configured",
    }));
    const result = await submitUserReviewUseCase(
      {
        authorName: "Maria Silva",
        authorEmail: "maria@example.com",
        rating: 4,
        comment: "Muito bom, recomendo a todos.",
      },
      "es",
      create,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.statusCode).toBe("notConfigured");
    }
  });
});
