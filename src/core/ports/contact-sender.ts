import type { ContactFormInput } from "@/core/entities/contact";

export type ContactSendPayload = ContactFormInput & {
  submittedAt: string;
};

export type ContactSendResult =
  | { ok: true }
  | { ok: false; reason?: string };

/** Port: infra implements; core use-case receives via injection. */
export type ContactSender = (payload: ContactSendPayload) => Promise<ContactSendResult>;
