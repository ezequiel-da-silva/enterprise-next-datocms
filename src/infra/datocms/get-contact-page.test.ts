import { describe, expect, it } from "vitest";
import { contactPageLabel, contactPagePath, isContactPageAliasSlug } from "./get-contact-page";

describe("contactPagePath", () => {
  it("uses the localized slug from the configured Page", () => {
    expect(
      contactPagePath("en", {
        id: "page-1",
        title: "Contact",
        slug: "contact",
      }),
    ).toBe("/en/contact");
  });

  it("keeps the historical path while Global setting is not configured", () => {
    expect(contactPagePath("pt", null)).toBe("/pt/contato");
    expect(contactPagePath("es", { id: "page-1", title: "Contacto", slug: null })).toBe("/es/contato");
  });
});

describe("contactPageLabel", () => {
  it("uses the Page title with a Contato fallback", () => {
    expect(contactPageLabel({ id: "page-1", title: "Get in touch", slug: "contact" })).toBe(
      "Get in touch",
    );
    expect(contactPageLabel(null)).toBe("Contato");
  });
});

describe("isContactPageAliasSlug", () => {
  it("matches localized contact slugs", () => {
    expect(isContactPageAliasSlug("contato")).toBe(true);
    expect(isContactPageAliasSlug("Contact")).toBe(true);
    expect(isContactPageAliasSlug("contacto")).toBe(true);
    expect(isContactPageAliasSlug("blog")).toBe(false);
  });
});
