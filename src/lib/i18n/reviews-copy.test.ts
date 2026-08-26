import { describe, expect, it } from "vitest";
import { APP_LOCALES } from "@/constants/i18n";
import { USER_REVIEW_ERROR_CODES } from "@/core/entities/user-review";
import {
  REVIEWS_COPY,
  formatRatingAverage,
  translateReviewFieldError,
} from "@/lib/i18n/reviews-copy";

describe("reviews copy", () => {
  it.each(APP_LOCALES)("covers every validation code in %s", (locale) => {
    for (const code of USER_REVIEW_ERROR_CODES) {
      expect(REVIEWS_COPY[locale].errors[code]).toBeTruthy();
    }
  });

  it.each(APP_LOCALES)("has form and status copy in %s", (locale) => {
    const copy = REVIEWS_COPY[locale];
    expect(copy.form.heading).toBeTruthy();
    expect(copy.form.submit).toBeTruthy();
    expect(copy.status.submitted).toBeTruthy();
    expect(copy.sectionLabel).toBeTruthy();
  });

  it("translates known codes and leaves unknown text untouched", () => {
    expect(translateReviewFieldError("authorEmail.invalid", "en")).toBe(
      "Enter a valid email address.",
    );
    expect(translateReviewFieldError("authorEmail.invalid", "pt")).toBe("Informe um e-mail válido.");
    /* Nunca esconder um erro inesperado do servidor. */
    expect(translateReviewFieldError("mensagem crua", "pt")).toBe("mensagem crua");
    expect(translateReviewFieldError(undefined, "es")).toBeUndefined();
  });

  it("pluralizes the aggregate label", () => {
    expect(REVIEWS_COPY.en.aggregateLabel("5.0", 1)).toContain("1 review");
    expect(REVIEWS_COPY.en.aggregateLabel("4.8", 12)).toContain("12 reviews");
    expect(REVIEWS_COPY.pt.aggregateLabel("4,8", 1)).toContain("1 avaliação");
    expect(REVIEWS_COPY.pt.aggregateLabel("4,8", 12)).toContain("12 avaliações");
    expect(REVIEWS_COPY.es.aggregateLabel("4,8", 2)).toContain("2 reseñas");
  });

  it("formats the average with one decimal per locale", () => {
    expect(formatRatingAverage(5, "en")).toBe("5.0");
    expect(formatRatingAverage(4.75, "pt")).toBe("4,8");
    expect(formatRatingAverage(4.2, "es")).toBe("4,2");
  });
});
