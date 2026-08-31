import { describe, expect, it } from "vitest";
import type { TeamMember } from "@/lib/datocms/resolve-team-section";
import { buildTeamSectionJsonLd } from "./build-team-section-jsonld";

const ada: TeamMember = {
  id: "a1",
  authorName: "Ada Lovelace",
  authorSlug: "ada",
  authorRole: "Mathematician",
  avatar: { asset: { url: "https://img.example/ada.jpg", alt: "Ada" } },
  socialLinks: [{ id: "s1", plataforma: "LinkedIn", url: "https://linkedin.com/in/ada" }],
};

describe("buildTeamSectionJsonLd", () => {
  it("returns null when there are no members", () => {
    expect(buildTeamSectionJsonLd("en", "sec-1", [])).toBeNull();
  });

  it("builds an ItemList of Person nodes aligned with author profile ids", () => {
    const graph = buildTeamSectionJsonLd("en", "sec-1", [ada], "Our team");
    expect(graph).not.toHaveProperty("@context");
    expect(graph).toMatchObject({
      "@type": "ItemList",
      "@id": "http://localhost:3000/#team-sec-1",
      name: "Our team",
      numberOfItems: 1,
    });
    const items = graph?.itemListElement as Record<string, unknown>[];
    expect(items[0]).toMatchObject({
      "@type": "ListItem",
      position: 1,
      item: {
        "@type": "Person",
        "@id": "http://localhost:3000/en/blog/author/ada#person",
        name: "Ada Lovelace",
        url: "http://localhost:3000/en/blog/author/ada",
        jobTitle: "Mathematician",
        image: "https://img.example/ada.jpg",
        sameAs: ["https://linkedin.com/in/ada"],
      },
    });
  });

  it("omits profile url when the author has no slug", () => {
    const graph = buildTeamSectionJsonLd("pt", "sec-2", [
      { ...ada, authorSlug: "", authorRole: "", socialLinks: [], avatar: null },
    ]);
    const person = (graph?.itemListElement as { item: Record<string, unknown> }[])[0]?.item;
    expect(person).toEqual({ "@type": "Person", name: "Ada Lovelace" });
  });
});
