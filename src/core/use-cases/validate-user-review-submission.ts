import { userReviewFormSchema, type UserReviewFormInput } from "@/core/entities/user-review";

export type UserReviewValidationResult =
  | { ok: true; data: UserReviewFormInput }
  | { ok: false; fieldErrors: Record<string, string> };

export function validateUserReviewSubmission(input: unknown): UserReviewValidationResult {
  const parsed = userReviewFormSchema.safeParse(input);
  if (parsed.success) {
    return { ok: true, data: parsed.data };
  }

  const fieldErrors: Record<string, string> = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  return { ok: false, fieldErrors };
}
