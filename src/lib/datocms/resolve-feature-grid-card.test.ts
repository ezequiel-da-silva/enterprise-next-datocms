import { describe, expect, it } from "vitest";
import {
  readCardIconJson,
  resolveCardLinkRecord,
  resolveCardShowImage,
  resolveCardShowLink,
} from "@/lib/datocms/resolve-feature-grid-card";

describe("resolve-feature-grid-card", () => {
  it("reads icon JSON from camelCase or snake_case", () => {
    expect(readCardIconJson({ iconCard: { prefix: "fas", iconName: "star" } })).toEqual({
      prefix: "fas",
      iconName: "star",
    });
    expect(readCardIconJson({ icon_card: { prefix: "far", iconName: "heart" } })).toEqual({
      prefix: "far",
      iconName: "heart",
    });
  });

  it("respects has_image and has_link toggles", () => {
    expect(resolveCardShowImage({ hasImage: false })).toBe(false);
    expect(resolveCardShowImage({ has_image: true })).toBe(true);
    expect(resolveCardShowLink({ hasLink: false })).toBe(false);
    expect(resolveCardShowLink({ has_link: true })).toBe(true);
  });

  it("resolves link_card with legacy button_card array", () => {
    const link = resolveCardLinkRecord({
      button_card: [{ __typename: "LinkRecord", id: "1", ctaLabel: "Go" }],
    });
    expect(link?.__typename).toBe("LinkRecord");
  });
});
