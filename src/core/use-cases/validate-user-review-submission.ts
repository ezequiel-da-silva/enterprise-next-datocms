import {
  isUserReviewErrorCode,
  userReviewFormSchema,
  type UserReviewErrorCode,
  type UserReviewFormInput,
} from "@/core/entities/user-review";

export type UserReviewValidationResult =
  | { ok: true; data: UserReviewFormInput }
  | { ok: false; fieldErrors: Record<string, UserReviewErrorCode> };

/** Erros que o Zod gera sozinho (tipo errado, campo em falta) não têm código próprio. */
const FALLBACK_ERROR_CODE: Record<string, UserReviewErrorCode> = {
  authorName: "authorName.min",
  authorEmail: "authorEmail.required",
  comment: "comment.min",
  rating: "rating.range",
};

export function validateUserReviewSubmission(input: unknown): UserReviewValidationResult {
  const parsed = userReviewFormSchema.safeParse(input);
  if (parsed.success) {
    return { ok: true, data: parsed.data };
  }

  const fieldErrors: Record<string, UserReviewErrorCode> = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0];
    if (typeof key !== "string" || fieldErrors[key]) continue;
    const code = isUserReviewErrorCode(issue.message) ? issue.message : FALLBACK_ERROR_CODE[key];
    if (code) fieldErrors[key] = code;
  }
  return { ok: false, fieldErrors };
}
