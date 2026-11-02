import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
}));

import { POST } from "./route";

const WEBHOOK_KEYS = [
  "SHOPIFY_CLIENT_ID",
  "SHOPIFY_API_SECRET_KEY",
  "SHOPIFY_STORE_DOMAIN",
  "DATOCMS_USER_REVIEWS_CDA_TOKEN",
] as const;

describe("POST /api/webhooks/shopify", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    for (const key of WEBHOOK_KEYS) vi.stubEnv(key, "");
  });

  afterEach(() => {
    errorSpy.mockRestore();
    vi.unstubAllEnvs();
  });

  it("returns a generic 500 and logs the missing names", async () => {
    const res = await POST(
      new NextRequest("https://example.com/api/webhooks/shopify", { method: "POST", body: "{}" }),
    );
    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({ error: "Webhook not configured" });
    const logged = errorSpy.mock.calls.map((call: readonly unknown[]) => String(call[0])).join("\n");
    expect(logged).toContain("SHOPIFY_API_SECRET_KEY");
    expect(logged).not.toContain('"missing":[');
  });
});
