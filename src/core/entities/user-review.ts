import "@/core/zod-jitless";
import { HONEYPOT_FIELD } from "@/constants/contact-form";
import { z } from "zod";

/**
 * O domínio não conhece idioma: valida e devolve códigos. A tradução vive em
 * `src/lib/i18n/reviews-copy.ts` e é aplicada na UI / Server Action.
 */
export const USER_REVIEW_ERROR_CODES = [
  "authorName.min",
  "authorName.max",
  "authorEmail.required",
  "authorEmail.invalid",
  "authorEmail.max",
  "comment.min",
  "comment.max",
  "rating.int",
  "rating.range",
] as const;

export type UserReviewErrorCode = (typeof USER_REVIEW_ERROR_CODES)[number];

export function isUserReviewErrorCode(value: string): value is UserReviewErrorCode {
  return (USER_REVIEW_ERROR_CODES as readonly string[]).includes(value);
}

/** Resultado global da submissão (sucesso, limite de tentativas ou falha de envio). */
export type UserReviewStatusCode =
  | "submitted"
  | "rateLimited"
  | "notConfigured"
  | "transportError";

const ratingSchema = z
  .number()
  .int("rating.int" satisfies UserReviewErrorCode)
  .min(1, "rating.range" satisfies UserReviewErrorCode)
  .max(5, "rating.range" satisfies UserReviewErrorCode);

const userReviewIdentitySchema = z.object({
  authorName: z
    .string()
    .trim()
    .min(2, "authorName.min" satisfies UserReviewErrorCode)
    .max(100, "authorName.max" satisfies UserReviewErrorCode),
  authorEmail: z
    .string()
    .trim()
    .min(1, "authorEmail.required" satisfies UserReviewErrorCode)
    .email("authorEmail.invalid" satisfies UserReviewErrorCode)
    .max(254, "authorEmail.max" satisfies UserReviewErrorCode),
  comment: z
    .string()
    .trim()
    .min(10, "comment.min" satisfies UserReviewErrorCode)
    .max(1000, "comment.max" satisfies UserReviewErrorCode),
});

export const userReviewFormSchema = userReviewIdentitySchema.extend({
  /** Aceita string do FormData ou número do RHF. */
  rating: z.preprocess((v) => {
    if (typeof v === "number") return v;
    if (typeof v === "string" && v.trim() !== "") return Number(v);
    return v;
  }, ratingSchema),
});

/** Cliente (RHF): rating numérico + honeypot sem validar conteúdo. */
export const userReviewFormClientSchema = userReviewIdentitySchema.extend({
  rating: ratingSchema,
  [HONEYPOT_FIELD]: z.string().max(200).optional(),
  locale: z.string().optional(),
});

export type UserReviewFormInput = z.infer<typeof userReviewFormSchema>;
export type UserReviewFormClientValues = z.infer<typeof userReviewFormClientSchema>;

/** `fieldErrors` viaja como código até ao cliente, que traduz no render. */
export type UserReviewActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; fieldErrors?: Record<string, UserReviewErrorCode>; message?: string };

export type UserReviewSubmitAction = (
  prev: UserReviewActionState,
  formData: FormData,
) => Promise<UserReviewActionState>;
