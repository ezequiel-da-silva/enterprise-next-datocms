import { describe, expect, it } from "vitest";
import { prioritizeCommerceNavLinks } from "@/lib/i18n/prioritize-commerce-nav";
import type { NavItemRecord } from "@/infra/datocms/types-navigation";

function item(id: string, label: string, link: string): NavItemRecord {
  return {
    __typename: "NavItemSimpleRecord",
    id,
    navItemLabel: label,
    navItemLink: link,
    navItemLinkAria: label,
    openInNewTab: false,
    submenu: [],
  };
}

describe("prioritizeCommerceNavLinks", () => {
  it("moves commerce links to the front without reordering within groups", () => {
    const input = [
      item("1", "Blog", "/blog"),
      item("2", "Shop", "/loja"),
      item("3", "Contact", "/contato"),
      item("4", "Collections", "/collections"),
      item("5", "Best of", "/best"),
    ];
    expect(prioritizeCommerceNavLinks(input).map((entry) => entry.id)).toEqual([
      "2",
      "4",
      "5",
      "1",
      "3",
    ]);
  });

  it("detects commerce by path when the label is generic", () => {
    const input = [item("a", "Explore", "/about"), item("b", "Store", "/en/shop")];
    expect(prioritizeCommerceNavLinks(input).map((entry) => entry.id)).toEqual(["b", "a"]);
  });

  it("treats Melhores as commerce", () => {
    const input = [item("1", "Blog", "/blog"), item("2", "Melhores", "/melhores")];
    expect(prioritizeCommerceNavLinks(input).map((entry) => entry.id)).toEqual(["2", "1"]);
  });
});
