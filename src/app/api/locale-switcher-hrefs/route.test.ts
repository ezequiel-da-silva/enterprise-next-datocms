import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("next/headers", () => ({
  draftMode: vi.fn(async () => ({ isEnabled: false })),
}));

vi.mock("@/lib/i18n/resolve-locale-switcher-hrefs", () => ({
  resolveLocaleSwitcherHrefs: vi.fn(),
}));

import { draftMode } from "next/headers";
import { resolveLocaleSwitcherHrefs } from "@/lib/i18n/resolve-locale-switcher-hrefs";
import { GET } from "./route";

function get(url: string): NextRequest {
  return new NextRequest(url, { method: "GET" });
}

describe("GET /api/locale-switcher-hrefs", () => {
  afterEach(() => {
    vi.mocked(resolveLocaleSwitcherHrefs).mockReset();
    vi.mocked(draftMode).mockResolvedValue({ isEnabled: false } as Awaited<ReturnType<typeof draftMode>>);
  });

  it("returns resolved hrefs for a locale CMS path", async () => {
    vi.mocked(resolveLocaleSwitcherHrefs).mockResolvedValue({
      en: "/en/contact",
      pt: "/pt/contato",
      es: "/es/contacto",
    });

    const res = await GET(get("https://example.com/api/locale-switcher-hrefs?pathname=/es/contacto"));

    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("private, max-age=30");
    await expect(res.json()).resolves.toEqual({
      en: "/en/contact",
      pt: "/pt/contato",
      es: "/es/contacto",
    });
    expect(resolveLocaleSwitcherHrefs).toHaveBeenCalledWith("/es/contacto", "es", false);
  });

  it("appends a safe search query to every locale href", async () => {
    vi.mocked(resolveLocaleSwitcherHrefs).mockResolvedValue({
      en: "/en/search",
      pt: "/pt/busca",
      es: "/es/busqueda",
    });

    const res = await GET(
      get("https://example.com/api/locale-switcher-hrefs?pathname=/pt/busca&q=next%20js"),
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      en: "/en/search?q=next+js",
      pt: "/pt/busca?q=next+js",
      es: "/es/busqueda?q=next+js",
    });
  });

  it("passes draft mode through to the resolver", async () => {
    vi.mocked(draftMode).mockResolvedValue({ isEnabled: true } as Awaited<ReturnType<typeof draftMode>>);
    vi.mocked(resolveLocaleSwitcherHrefs).mockResolvedValue({
      en: "/en",
      pt: "/pt",
      es: "/es",
    });

    await GET(get("https://example.com/api/locale-switcher-hrefs?pathname=/en"));

    expect(resolveLocaleSwitcherHrefs).toHaveBeenCalledWith("/en", "en", true);
  });

  it("rejects missing, absolute, or unsafe pathnames", async () => {
    const cases = [
      "https://example.com/api/locale-switcher-hrefs",
      "https://example.com/api/locale-switcher-hrefs?pathname=",
      "https://example.com/api/locale-switcher-hrefs?pathname=https://evil.com",
      "https://example.com/api/locale-switcher-hrefs?pathname=//evil.com",
      "https://example.com/api/locale-switcher-hrefs?pathname=/evil",
      "https://example.com/api/locale-switcher-hrefs?pathname=%2Fpt%2Ffoo%3Fx%3D1",
      "https://example.com/api/locale-switcher-hrefs?pathname=/pt/../admin",
      "https://example.com/api/locale-switcher-hrefs?pathname=/pt/javascript:alert(1)",
    ];

    for (const url of cases) {
      vi.mocked(resolveLocaleSwitcherHrefs).mockClear();
      const res = await GET(get(url));
      expect(res.status, url).toBe(400);
      expect(resolveLocaleSwitcherHrefs, url).not.toHaveBeenCalled();
    }
  });
});
