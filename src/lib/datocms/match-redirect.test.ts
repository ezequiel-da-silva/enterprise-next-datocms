import { describe, expect, it } from "vitest";
import { matchRedirect } from "./match-redirect";

const rec = (from: string, to: string, status = "301") => ({
  fromPathRedirect: from,
  toPathRedirect: to,
  statusRedirect: status,
});

describe("matchRedirect", () => {
  it("matches a locale-prefixed from_path exactly", () => {
    expect(matchRedirect("/en/contact", [rec("/en/contact", "/en/contato")])).toEqual({
      destination: "/en/contato",
      status: 301,
    });
    expect(matchRedirect("/pt/contact", [rec("/en/contact", "/en/contato")])).toBeNull();
  });

  it("expands a suffix from_path across locales and preserves locale on to_path", () => {
    expect(matchRedirect("/pt/contact", [rec("/contact", "/contato")])).toEqual({
      destination: "/pt/contato",
      status: 301,
    });
    expect(matchRedirect("/en/contact", [rec("/contact", "/contato")])).toEqual({
      destination: "/en/contato",
      status: 301,
    });
  });

  it("matches an unprefixed suffix path and sends it to the default locale", () => {
    expect(matchRedirect("/contact", [rec("/contact", "/contato")])).toEqual({
      destination: "/en/contato",
      status: 301,
    });
  });

  it("does not treat from_path / as a redirect for every locale home", () => {
    expect(matchRedirect("/en", [rec("/", "/pt")])).toBeNull();
    expect(matchRedirect("/pt", [rec("/", "/en")])).toBeNull();
  });

  it("rejects internal destinations that could open-redirect or hit APIs", () => {
    expect(matchRedirect("/en/old", [rec("/en/old", "/\\evil.example")])).toBeNull();
    expect(matchRedirect("/en/old", [rec("/en/old", "/api/draft")])).toBeNull();
    expect(matchRedirect("/en/old", [rec("/en/old", "/en/new\r\nLocation: https://evil.example")])).toBeNull();
  });

  it("prefers an exact match over a suffix record", () => {
    const records = [rec("/contact", "/contato", "302"), rec("/en/contact", "/en/contato-exact", "301")];
    expect(matchRedirect("/en/contact", records)).toEqual({
      destination: "/en/contato-exact",
      status: 301,
    });
  });

  it("uses 302 when the CMS status is temporary", () => {
    expect(matchRedirect("/en/old", [rec("/en/old", "/en/new", "302")])).toEqual({
      destination: "/en/new",
      status: 302,
    });
  });

  it("allows a safe https destination and rejects javascript, protocol-relative, and http", () => {
    expect(matchRedirect("/en/old", [rec("/en/old", "https://example.com/x")])).toEqual({
      destination: "https://example.com/x",
      status: 301,
    });
    expect(matchRedirect("/en/old", [rec("/en/old", "javascript:alert(1)")])).toBeNull();
    expect(matchRedirect("/en/old", [rec("/en/old", "//evil.example")])).toBeNull();
    expect(matchRedirect("/en/old", [rec("/en/old", "http://example.com")])).toBeNull();
  });

  it("skips a record that would loop onto the same path", () => {
    expect(matchRedirect("/en/contact", [rec("/en/contact", "/en/contact")])).toBeNull();
    expect(matchRedirect("/en/contact", [rec("/contact", "/contact")])).toBeNull();
  });

  it("ignores invalid status and does not match / or /api", () => {
    expect(matchRedirect("/en/old", [rec("/en/old", "/en/new", "308")])).toBeNull();
    expect(matchRedirect("/", [rec("/", "/en")])).toBeNull();
    expect(matchRedirect("/api/draft", [rec("/api/draft", "/en")])).toBeNull();
  });

  it("reads snake_case field names from CMA-style payloads", () => {
    expect(
      matchRedirect("/en/a", [
        { from_path_redirect: "/en/a", to_path_redirect: "/en/b", status_redirect: "301" },
      ]),
    ).toEqual({ destination: "/en/b", status: 301 });
  });
});
