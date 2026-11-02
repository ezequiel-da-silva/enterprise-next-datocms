import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

const SECRET = "revalidate-secret";

describe("POST /api/webhooks/datocms/collection-page", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
    vi.unstubAllEnvs();
  });

  it("rejects the revalidate secret in the query string", async () => {
    vi.stubEnv("DATOCMS_REVALIDATE_SECRET", SECRET);
    const res = await POST(
      new NextRequest(`https://example.com/api/webhooks/datocms/collection-page?token=${SECRET}`, {
        method: "POST",
        body: "{}",
      }),
    );
    expect(res.status).toBe(401);
  });

  it("hides the missing secret name from the 500 body", async () => {
    vi.stubEnv("DATOCMS_REVALIDATE_SECRET", "");
    const res = await POST(
      new NextRequest("https://example.com/api/webhooks/datocms/collection-page", {
        method: "POST",
        body: "{}",
      }),
    );
    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({ error: "Webhook not configured" });
    expect(errorSpy.mock.calls.map((call) => String(call[0])).join("\n")).toContain("DATOCMS_REVALIDATE_SECRET");
  });
});