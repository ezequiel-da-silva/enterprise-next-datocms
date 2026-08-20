import type { AppLocale } from "@/constants/i18n";
import type { UserReviewFormInput } from "@/core/entities/user-review";

export type CreateUserReviewPayload = UserReviewFormInput & {
  locale: AppLocale;
};

export type CreateUserReviewResult =
  | { ok: true }
  | { ok: false; reason?: "not_configured" | "transport_error" | string };

/** Port: infra implements; core use-case receives via injection. */
export type UserReviewCreator = (
  payload: CreateUserReviewPayload,
) => Promise<CreateUserReviewResult>;
