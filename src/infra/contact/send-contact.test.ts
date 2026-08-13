import { afterEach, describe, expect, it, vi } from "vitest";

describe("sendContactMessage", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  it("returns not_configured in production when webhook is missing", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("CONTACT_WEBHOOK_URL", "");
    const { sendContactMessage } = await import("@/infra/contact/send-contact");

    const result = await sendContactMessage({
      name: "Ada",
      email: "ada@example.com",
      message: "Hello",
      submittedAt: new Date().toISOString(),
    });

    expect(result).toEqual({ ok: false, reason: "not_configured" });
  });

  it("simulates success in development when webhook is missing", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("CONTACT_WEBHOOK_URL", "");
    const { sendContactMessage } = await import("@/infra/contact/send-contact");

    const result = await sendContactMessage({
      name: "Ada",
      email: "ada@example.com",
      message: "Hello",
      submittedAt: new Date().toISOString(),
    });

    expect(result).toEqual({ ok: true });
  });
});
