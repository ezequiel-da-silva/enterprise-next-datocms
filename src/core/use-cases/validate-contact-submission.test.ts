import { describe, expect, it } from "vitest";
import { validateContactSubmission } from "@/core/use-cases/validate-contact-submission";

describe("validateContactSubmission", () => {
  it("accepts valid input", () => {
    const result = validateContactSubmission({
      name: "Ana Silva",
      email: "ana@example.com",
      message: "Mensagem com conteúdo suficiente.",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.email).toBe("ana@example.com");
    }
  });

  it("rejects invalid email", () => {
    const result = validateContactSubmission({
      name: "Ana",
      email: "not-an-email",
      message: "Mensagem válida aqui.",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors.email).toBeTruthy();
    }
  });

  it("rejects short message", () => {
    const result = validateContactSubmission({
      name: "Ana Silva",
      email: "ana@example.com",
      message: "curta",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors.message).toBeTruthy();
    }
  });
});
