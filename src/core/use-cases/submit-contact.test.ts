import { describe, expect, it, vi } from "vitest";
import type { ContactSender } from "@/core/ports/contact-sender";
import { submitContactUseCase } from "@/core/use-cases/submit-contact";

describe("submitContactUseCase", () => {
  it("returns field errors for invalid input", async () => {
    const send = vi.fn<ContactSender>();
    const result = await submitContactUseCase({ name: "A", email: "bad", message: "x" }, send);
    expect(result.ok).toBe(false);
    expect(send).not.toHaveBeenCalled();
  });

  it("sends valid submission", async () => {
    const send = vi.fn<ContactSender>(async () => ({ ok: true }));
    const result = await submitContactUseCase(
      {
        name: "João Souza",
        email: "joao@example.com",
        message: "Preciso de ajuda com o produto.",
      },
      send,
    );
    expect(result.ok).toBe(true);
    expect(send).toHaveBeenCalledOnce();
  });

  it("surfaces transport errors", async () => {
    const send = vi.fn<ContactSender>(async () => ({ ok: false, reason: "transport_error" }));
    const result = await submitContactUseCase(
      {
        name: "João Souza",
        email: "joao@example.com",
        message: "Preciso de ajuda com o produto.",
      },
      send,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain("Não foi possível");
    }
  });
});
