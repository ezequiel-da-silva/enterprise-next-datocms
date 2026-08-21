import { describe, expect, it } from "vitest";
import {
  buildLocaleSwitcherHrefs,
  hrefForLocale,
  isSafeLocalePath,
  parseLocalePath,
  slugPathsFromBlogRecord,
  slugPathsFromCmsLocales,
} from "@/lib/i18n/locale-switch-href";

describe("parseLocalePath", () => {
  it("parses locale homes and CMS pages", () => {
    expect(parseLocalePath("/en")).toEqual({ kind: "home" });
    expect(parseLocalePath("/pt/")).toEqual({ kind: "home" });
    expect(parseLocalePath("/en/page-two")).toEqual({ kind: "cms", slug: "page-two" });
    expect(parseLocalePath("/page-two")).toEqual({ kind: "cms", slug: "page-two" });
  });

  it("parses blog routes and root static pages", () => {
    expect(parseLocalePath("/en/blog")).toEqual({ kind: "blog" });
    expect(parseLocalePath("/es/blog/hello-world")).toEqual({ kind: "post", slug: "hello-world" });
    expect(parseLocalePath("/pt/blog/author/ada")).toEqual({ kind: "author", slug: "ada" });
    expect(parseLocalePath("/en/blog/category/news")).toEqual({ kind: "category", slug: "news" });
    expect(parseLocalePath("/contato")).toEqual({ kind: "root-static" });
    expect(parseLocalePath("/busca")).toEqual({ kind: "root-static" });
  });
});

describe("buildLocaleSwitcherHrefs", () => {
  it("maps homes and prefix-swaps the blog index", () => {
    expect(buildLocaleSwitcherHrefs("/en")).toEqual({
      en: "/en",
      pt: "/pt",
      es: "/es",
    });
    expect(buildLocaleSwitcherHrefs("/pt/blog")).toEqual({
      en: "/en/blog",
      pt: "/pt/blog",
      es: "/es/blog",
    });
  });

  it("sends contato and busca to locale homes", () => {
    expect(hrefForLocale("/contato", "en")).toBe("/en");
    expect(hrefForLocale("/busca?q=foo", "es")).toBe("/es");
  });

  it("uses per-locale CMS slugs and falls back to home when missing", () => {
    const slugPaths = slugPathsFromCmsLocales([
      { locale: "en", value: "page-two" },
      { locale: "pt_BR", value: "pagina-dois" },
    ]);
    const hrefs = buildLocaleSwitcherHrefs("/en/page-two", slugPaths);
    expect(hrefs.en).toBe("/en/page-two");
    expect(hrefs.pt).toBe("/pt/pagina-dois");
    expect(hrefs.es).toBe("/es");
  });

  it("rejects paths outside the locale whitelist", () => {
    expect(isSafeLocalePath("/pt/pagina-dois", "pt")).toBe(true);
    expect(isSafeLocalePath("/pt/pagina-dois", "es")).toBe(false);
    expect(isSafeLocalePath("//evil.com")).toBe(false);
    expect(isSafeLocalePath("/evil.com")).toBe(false);
    expect(isSafeLocalePath("https://evil.com")).toBe(false);
    expect(isSafeLocalePath("/pt/..%2f..%2fadmin")).toBe(false);
    expect(isSafeLocalePath("/pt/javascript:alert(1)")).toBe(false);
    expect(isSafeLocalePath("/pt/foo?x=1")).toBe(false);
    expect(isSafeLocalePath("/pt/foo#x")).toBe(false);
    expect(isSafeLocalePath("/pt/foo@evil")).toBe(false);
    expect(isSafeLocalePath("/pt/%2e%2e")).toBe(false);
  });

  it("falls back to the locale home when a CMS slug would escape the site", () => {
    const hrefs = buildLocaleSwitcherHrefs("/en/page-two", {
      en: "/en/page-two",
      pt: "//evil.com",
      es: "/es/../admin",
    });
    expect(hrefs.en).toBe("/en/page-two");
    expect(hrefs.pt).toBe("/pt");
    expect(hrefs.es).toBe("/es");
  });

  it("maps blog post slugs per locale", () => {
    const slugPaths = slugPathsFromBlogRecord("post", [
      { locale: "en", value: "hello" },
      { locale: "es", value: "hola" },
    ]);
    expect(hrefForLocale("/en/blog/hello", "es", slugPaths)).toBe("/es/blog/hola");
    expect(hrefForLocale("/en/blog/hello", "pt", slugPaths)).toBe("/pt");
  });
});
