import { describe, expect, it, vi, beforeEach } from "vitest";
import { submitContactUseCase } from "@/core/use-cases/submit-contact";

vi.mock("@/infra/contact/send-contact", () => ({
  sendContactMessage: vi.fn(async () => ({ ok: true as const })),
}));

import { sendContactMessage } from "@/infra/contact/send-contact";

describe("submitContactUseCase", () => {
  beforeEach(() => {
    vi.mocked(sendContactMessage).mockClear();
  });

  it("returns field errors for invalid input", async () => {
    const result = await submitContactUseCase({ name: "A", email: "bad", message: "x" });
    expect(result.ok).toBe(false);
    expect(sendContactMessage).not.toHaveBeenCalled();
  });

  it("sends valid submission", async () => {
    const result = await submitContactUseCase({
      name: "João Souza",
      email: "joao@example.com",
      message: "Preciso de ajuda com o produto.",
    });
    expect(result.ok).toBe(true);
    expect(sendContactMessage).toHaveBeenCalledOnce();
  });

  it("surfaces transport errors", async () => {
    vi.mocked(sendContactMessage).mockResolvedValueOnce({ ok: false, reason: "transport_error" });
    const result = await submitContactUseCase({
      name: "João Souza",
      email: "joao@example.com",
      message: "Preciso de ajuda com o produto.",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain("Não foi possível");
    }
  });
});
