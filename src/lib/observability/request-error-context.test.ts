import { describe, expect, it } from "vitest";
import { requestErrorContext } from "@/lib/observability/request-error-context";

describe("requestErrorContext", () => {
  it("drops the query string and keeps the digest", () => {
    const error = Object.assign(new Error("boom"), { digest: "123456" });
    expect(
      requestErrorContext(
        error,
        { path: "/api/account/callback?code=abc&state=xyz", method: "GET" },
        { routePath: "/api/account/callback", revalidateReason: undefined },
      ),
    ).toEqual({
      path: "/api/account/callback",
      method: "GET",
      routePath: "/api/account/callback",
      renderSource: undefined,
      revalidateReason: undefined,
      digest: "123456",
    });
  });

  it("ignores non-string or missing digests", () => {
    const request = { path: "/en", method: "GET" };
    const context = { routePath: "/[slug]", renderSource: "react-server-components" };
    expect(requestErrorContext({ digest: 42 }, request, context).digest).toBeUndefined();
    expect(requestErrorContext("boom", request, context).digest).toBeUndefined();
  });
});
