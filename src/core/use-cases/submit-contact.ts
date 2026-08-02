import type { ContactFormInput } from "@/core/entities/contact";
import { validateContactSubmission, type ContactValidationResult } from "@/core/use-cases/validate-contact-submission";
import { sendContactMessage } from "@/infra/contact/send-contact";

export type SubmitContactResult =
  | { ok: true; message: string }
  | { ok: false; fieldErrors?: Record<string, string>; message?: string };

export async function submitContactUseCase(input: unknown): Promise<SubmitContactResult> {
  const validated: ContactValidationResult = validateContactSubmission(input);
  if (!validated.ok) {
    return { ok: false, fieldErrors: validated.fieldErrors };
  }

  const sent = await sendContactMessage({
    ...validated.data,
    submittedAt: new Date().toISOString(),
  });

  if (!sent.ok) {
    return {
      ok: false,
      message: "Não foi possível enviar a mensagem. Tente novamente mais tarde.",
    };
  }

  return {
    ok: true,
    message: "Recebemos sua mensagem. Retornaremos em breve.",
  };
}

export type { ContactFormInput };
