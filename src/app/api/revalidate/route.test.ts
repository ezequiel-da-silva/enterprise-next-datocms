import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
}));

import { revalidateTag } from "next/cache";
import { POST } from "./route";

const SECRET = "revalidate-secret";

function post(url: string, authorization?: string): NextRequest {
  return new NextRequest(url, {
    method: "POST",
    headers: authorization ? { authorization } : {},
    body: "{}",
  });
}

describe("POST /api/revalidate", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.mocked(revalidateTag).mockClear();
  });

  it("revalidates when the Bearer secret matches", async () => {
    vi.stubEnv("DATOCMS_REVALIDATE_SECRET", SECRET);
    const res = await POST(post("https://example.com/api/revalidate", `Bearer ${SECRET}`));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({ revalidated: true });
    expect(revalidateTag).toHaveBeenCalled();
  });

  it("rejects the same secret when it arrives as ?token=", async () => {
    vi.stubEnv("DATOCMS_REVALIDATE_SECRET", SECRET);
    const res = await POST(post(`https://example.com/api/revalidate?token=${SECRET}`));
    expect(res.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
