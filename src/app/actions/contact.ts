"use server";

import { HONEYPOT_FIELD } from "@/constants/contact-form";
import type { ContactActionState } from "@/core/entities/contact";
import { submitContactUseCase } from "@/core/use-cases/submit-contact";
import { sendContactMessage } from "@/infra/contact/send-contact";
import { getClientIpKey } from "@/lib/security/client-ip";
import { checkRateLimit } from "@/lib/security/rate-limit";

async function normalizeBotDelay(): Promise<void> {
  await new Promise((r) => setTimeout(r, 250 + Math.floor(Math.random() * 120)));
}

export async function submitContact(
  _prev: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const honeypot = String(formData.get(HONEYPOT_FIELD) ?? "");

  if (honeypot.trim().length > 0) {
    await normalizeBotDelay();
    return { status: "success", message: "Mensagem recebida." };
  }

  const ipKey = await getClientIpKey("contact");
  const rate = checkRateLimit(ipKey, { limit: 5, windowMs: 60_000 });
  if (!rate.ok) {
    return {
      status: "error",
      message: "Muitas tentativas. Aguarde um minuto e tente novamente.",
    };
  }

  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  };

  const result = await submitContactUseCase(raw, sendContactMessage);

  if (!result.ok) {
    return {
      status: "error",
      fieldErrors: result.fieldErrors,
      message: result.message,
    };
  }

  return { status: "success", message: result.message };
}
