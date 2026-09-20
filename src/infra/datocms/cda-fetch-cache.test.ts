import { afterEach, describe, expect, it, vi } from "vitest";
import { cdaFetchCache } from "./cda-fetch-cache";

describe("cdaFetchCache", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("always bypasses cache in draft mode", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(
      cdaFetchCache({
        includeDrafts: true,
        tags: ["datocms:navigation"],
        revalidate: 300,
      }),
    ).toEqual({ tags: undefined, revalidate: false, cache: "no-store" });
  });

  it("keeps ISR tags in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(
      cdaFetchCache({
        includeDrafts: false,
        tags: ["datocms:redirects"],
        revalidate: 300,
      }),
    ).toEqual({ tags: ["datocms:redirects"], revalidate: 300, cache: undefined });
  });

  it("uses a short revalidate in next dev instead of no-store", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(
      cdaFetchCache({
        includeDrafts: false,
        tags: ["datocms:navigation"],
        revalidate: 300,
      }),
    ).toEqual({ tags: ["datocms:navigation"], revalidate: 60, cache: undefined });
  });

  it("still no-stores record fetches in next dev when opted in", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(
      cdaFetchCache({
        includeDrafts: false,
        tags: ["datocms:page"],
        revalidate: 120,
        bypassPublishedCacheInDev: true,
      }),
    ).toEqual({ tags: undefined, revalidate: false, cache: "no-store" });
  });
});
