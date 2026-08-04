import type { ContactSender } from "@/core/ports/contact-sender";
import { validateContactSubmission, type ContactValidationResult } from "@/core/use-cases/validate-contact-submission";

export type SubmitContactResult =
  | { ok: true; message: string }
  | { ok: false; fieldErrors?: Record<string, string>; message?: string };

export async function submitContactUseCase(
  input: unknown,
  sendMessage: ContactSender,
): Promise<SubmitContactResult> {
  const validated: ContactValidationResult = validateContactSubmission(input);
  if (!validated.ok) {
    return { ok: false, fieldErrors: validated.fieldErrors };
  }

  const sent = await sendMessage({
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

export type { ContactFormInput } from "@/core/entities/contact";
