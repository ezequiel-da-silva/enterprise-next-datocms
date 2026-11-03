import { beforeEach, describe, expect, it, vi } from "vitest";

const datocmsFetch = vi.fn();
vi.mock("@/infra/datocms/client", () => ({
  datocmsFetch: (...args: unknown[]) => datocmsFetch(...args),
}));

const HOMES = ["https://example.com/en", "https://example.com/pt", "https://example.com/es"];

beforeEach(() => {
  datocmsFetch.mockReset();
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com");
});

async function loadEntries() {
  vi.resetModules();
  const sitemap = await import("./get-sitemap");
  return sitemap.getSitemapEntries();
}

describe("getSitemapEntries", () => {
  it("returns the three locale homes when the catalog query errors", async () => {
    datocmsFetch.mockResolvedValue({ errors: [{ message: "down" }] });

    const entries = await loadEntries();

    expect(entries.map((entry) => entry.url)).toEqual(HOMES);
  });

  it("returns the three locale homes when building the catalog throws", async () => {
    datocmsFetch.mockImplementation(() => {
      throw new Error("sitemap boom");
    });

    const entries = await loadEntries();

    expect(entries.map((entry) => entry.url)).toEqual(HOMES);
  });

  it("keeps a page when _updatedAt is not a date", async () => {
    datocmsFetch.mockResolvedValueOnce({
      data: {
        pagesEn: [{ slug: "about", _updatedAt: "not-a-date", seoSettingsSocial: { noIndex: false } }],
        pagesPtBR: [],
        pagesEs: [],
        postsEn: [],
        postsPtBR: [],
        postsEs: [],
        authorsEn: [],
        authorsPtBR: [],
        authorsEs: [],
        categoriesEn: [],
        categoriesPtBR: [],
        categoriesEs: [],
      },
    });
    datocmsFetch.mockResolvedValue({ errors: [{ message: "skip" }] });

    const entries = await loadEntries();
    const about = entries.find((entry) => entry.url === "https://example.com/en/about");

    expect(about?.lastModified).toBeInstanceOf(Date);
    expect(Number.isNaN((about?.lastModified as Date).getTime())).toBe(false);
  });
});
