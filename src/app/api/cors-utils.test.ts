import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { resolveDatoCorsOrigin } from "@/app/api/cors-utils";

describe("resolveDatoCorsOrigin", () => {
  beforeEach(() => {
    vi.stubEnv("DATOCMS_ADMIN_FRAME_ANCESTOR", "https://my-project.admin.datocms.com");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("allows plugins CDN", () => {
    expect(resolveDatoCorsOrigin("https://plugins-cdn.datocms.com")).toBe(
      "https://plugins-cdn.datocms.com",
    );
  });

  it("allows configured admin frame ancestor", () => {
    expect(resolveDatoCorsOrigin("https://my-project.admin.datocms.com")).toBe(
      "https://my-project.admin.datocms.com",
    );
  });

  it("allows other *.admin.datocms.com hosts", () => {
    expect(resolveDatoCorsOrigin("https://other.admin.datocms.com")).toBe(
      "https://other.admin.datocms.com",
    );
  });

  it("rejects unknown origins and missing Origin", () => {
    expect(resolveDatoCorsOrigin(null)).toBeNull();
    expect(resolveDatoCorsOrigin("https://evil.example")).toBeNull();
  });
});
