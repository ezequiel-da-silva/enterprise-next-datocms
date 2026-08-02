import type { ContactFormInput } from "@/core/entities/contact";

export type SendContactPayload = ContactFormInput & {
  submittedAt: string;
};

export type SendContactResult =
  | { ok: true }
  | { ok: false; reason: "transport_error" | "not_configured" };

/**
 * Adaptador de envio do formulário de contacto.
 * Usa `CONTACT_WEBHOOK_URL` quando definido; caso contrário regista em dev e simula sucesso.
 */
export async function sendContactMessage(payload: SendContactPayload): Promise<SendContactResult> {
  const webhook = process.env.CONTACT_WEBHOOK_URL?.trim();

  if (!webhook) {
    if (process.env.NODE_ENV === "development") {
      console.info("[contact] CONTACT_WEBHOOK_URL não definido — mensagem simulada:", {
        name: payload.name,
        email: payload.email,
        messageLength: payload.message.length,
      });
    }
    return { ok: true };
  }

  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      return { ok: false, reason: "transport_error" };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: "transport_error" };
  }
}
