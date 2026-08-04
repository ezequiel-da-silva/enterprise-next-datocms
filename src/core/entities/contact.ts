import { HONEYPOT_FIELD } from "@/constants/contact-form";
import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome.").max(120),
  email: z.string().trim().email("E-mail inválido.").max(254),
  message: z
    .string()
    .trim()
    .min(10, "A mensagem deve ter pelo menos 10 caracteres.")
    .max(5000),
});

/** Cliente (RHF): inclui honeypot sem validar conteúdo — o servidor aplica a armadilha. */
export const contactFormClientSchema = contactFormSchema.extend({
  [HONEYPOT_FIELD]: z.string().max(200).optional(),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type ContactFormClientValues = z.infer<typeof contactFormClientSchema>;

export type ContactActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; fieldErrors?: Record<string, string>; message?: string };
