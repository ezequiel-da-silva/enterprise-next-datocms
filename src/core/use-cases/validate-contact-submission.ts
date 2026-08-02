import { contactFormSchema, type ContactFormInput } from "@/core/entities/contact";
import type { ZodError } from "zod";

export type ContactValidationResult =
  | { ok: true; data: ContactFormInput }
  | { ok: false; fieldErrors: Record<string, string>; formError?: string };

function formatZodError(error: ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path[0];
    if (typeof path === "string" && !fieldErrors[path]) {
      fieldErrors[path] = issue.message;
    }
  }
  return fieldErrors;
}

export function validateContactSubmission(
  input: unknown,
): ContactValidationResult {
  const parsed = contactFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: formatZodError(parsed.error) };
  }
  return { ok: true, data: parsed.data };
}
