import { afterEach, describe, expect, it, vi } from "vitest";
import { datocmsFetch } from "@/infra/datocms/client";

const QUERY = "{ _site { locales } }";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("datocmsFetch", () => {
  it("reports a missing token instead of calling the API", async () => {
    vi.stubEnv("DATOCMS_API_TOKEN", "");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const result = await datocmsFetch({ query: QUERY });

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result).toEqual({ errors: [{ message: "Missing DATOCMS_API_TOKEN" }] });
  });

  it("turns a transport failure into the error shape (no throw)", async () => {
    vi.stubEnv("DATOCMS_API_TOKEN", "token");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("fetch failed")),
    );

    const result = await datocmsFetch({ query: QUERY });

    expect("errors" in result && result.errors[0]?.message).toContain("falha de rede");
  });

  it("turns a malformed body into the error shape (no throw)", async () => {
    vi.stubEnv("DATOCMS_API_TOKEN", "token");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.reject(new SyntaxError("Unexpected non-whitespace character after JSON")),
      }),
    );

    const result = await datocmsFetch({ query: QUERY });

    expect("errors" in result && result.errors[0]?.message).toContain("JSON malformado");
  });

  it("returns data on success", async () => {
    vi.stubEnv("DATOCMS_API_TOKEN", "token");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: { _site: { locales: ["en"] } } }),
      }),
    );

    const result = await datocmsFetch<{ _site: { locales: string[] } }>({ query: QUERY });

    expect(result).toEqual({ data: { _site: { locales: ["en"] } } });
  });
});
