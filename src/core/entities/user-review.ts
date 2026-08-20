import { HONEYPOT_FIELD } from "@/constants/contact-form";
import { z } from "zod";

const ratingSchema = z
  .number()
  .int("A avaliação deve ser um número inteiro.")
  .min(1, "Escolha uma avaliação de 1 a 5.")
  .max(5, "Escolha uma avaliação de 1 a 5.");

export const userReviewFormSchema = z.object({
  authorName: z
    .string()
    .trim()
    .min(2, "Informe seu nome com pelo menos 2 caracteres.")
    .max(100, "O nome deve ter no máximo 100 caracteres."),
  authorEmail: z
    .string()
    .trim()
    .min(1, "Informe seu e-mail.")
    .email("Informe um e-mail válido.")
    .max(254, "O e-mail deve ter no máximo 254 caracteres."),
  /** Aceita string do FormData ou número do RHF. */
  rating: z.preprocess((v) => {
    if (typeof v === "number") return v;
    if (typeof v === "string" && v.trim() !== "") return Number(v);
    return v;
  }, ratingSchema),
  comment: z
    .string()
    .trim()
    .min(10, "O comentário deve ter pelo menos 10 caracteres.")
    .max(1000, "O comentário deve ter no máximo 1000 caracteres."),
});

/** Cliente (RHF): rating numérico + honeypot sem validar conteúdo. */
export const userReviewFormClientSchema = z.object({
  authorName: z
    .string()
    .trim()
    .min(2, "Informe seu nome com pelo menos 2 caracteres.")
    .max(100, "O nome deve ter no máximo 100 caracteres."),
  authorEmail: z
    .string()
    .trim()
    .min(1, "Informe seu e-mail.")
    .email("Informe um e-mail válido.")
    .max(254, "O e-mail deve ter no máximo 254 caracteres."),
  rating: ratingSchema,
  comment: z
    .string()
    .trim()
    .min(10, "O comentário deve ter pelo menos 10 caracteres.")
    .max(1000, "O comentário deve ter no máximo 1000 caracteres."),
  [HONEYPOT_FIELD]: z.string().max(200).optional(),
  locale: z.string().optional(),
});

export type UserReviewFormInput = z.infer<typeof userReviewFormSchema>;
export type UserReviewFormClientValues = z.infer<typeof userReviewFormClientSchema>;

export type UserReviewActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; fieldErrors?: Record<string, string>; message?: string };
