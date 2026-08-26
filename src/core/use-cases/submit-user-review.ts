import type { AppLocale } from "@/constants/i18n";
import type { UserReviewCreator } from "@/core/ports/user-review-creator";
import type { UserReviewErrorCode, UserReviewStatusCode } from "@/core/entities/user-review";
import {
  validateUserReviewSubmission,
  type UserReviewValidationResult,
} from "@/core/use-cases/validate-user-review-submission";

export type SubmitUserReviewResult =
  | { ok: true; statusCode: UserReviewStatusCode }
  | { ok: false; fieldErrors?: Record<string, UserReviewErrorCode>; statusCode?: UserReviewStatusCode };

export async function submitUserReviewUseCase(
  input: unknown,
  locale: AppLocale,
  createReview: UserReviewCreator,
): Promise<SubmitUserReviewResult> {
  const validated: UserReviewValidationResult = validateUserReviewSubmission(input);
  if (!validated.ok) {
    return { ok: false, fieldErrors: validated.fieldErrors };
  }

  const created = await createReview({
    ...validated.data,
    locale,
  });

  if (!created.ok) {
    return {
      ok: false,
      statusCode: created.reason === "not_configured" ? "notConfigured" : "transportError",
    };
  }

  return { ok: true, statusCode: "submitted" };
}

export type { UserReviewFormInput } from "@/core/entities/user-review";
