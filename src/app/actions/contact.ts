"use server";

import { HONEYPOT_FIELD } from "@/constants/contact-form";
import { submitContactUseCase } from "@/core/use-cases/submit-contact";

export type ContactActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; fieldErrors?: Record<string, string>; message?: string };

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

  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  };

  const result = await submitContactUseCase(raw);
  if (!result.ok) {
    return {
      status: "error",
      fieldErrors: result.fieldErrors,
      message: result.message,
    };
  }

  return { status: "success", message: result.message };
}
