import type { AppLocale } from "@/constants/i18n";
import type { UserReviewCreator } from "@/core/ports/user-review-creator";
import {
  validateUserReviewSubmission,
  type UserReviewValidationResult,
} from "@/core/use-cases/validate-user-review-submission";

export type SubmitUserReviewResult =
  | { ok: true; message: string }
  | { ok: false; fieldErrors?: Record<string, string>; message?: string };

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
    if (created.reason === "not_configured") {
      return {
        ok: false,
        message: "Envio de avaliações temporariamente indisponível. Tente mais tarde.",
      };
    }
    return {
      ok: false,
      message: "Não foi possível enviar a avaliação. Tente novamente mais tarde.",
    };
  }

  return {
    ok: true,
    message: "Recebemos seu depoimento. Ele será publicado após moderação.",
  };
}

export type { UserReviewFormInput } from "@/core/entities/user-review";
