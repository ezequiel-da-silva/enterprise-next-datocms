import { describe, expect, it } from "vitest";
import {
  readCardIconJson,
  readFeatureGridCardContent,
  resolveCardLinkRecord,
  resolveCardShowDescription,
  resolveCardShowIcon,
  resolveCardShowImage,
  resolveCardShowLink,
} from "@/lib/datocms/resolve-feature-grid-card";
import type { CardRecord } from "@/infra/datocms/types-page";

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

  it("respects has_icon, has_description, has_image and has_link toggles", () => {
    expect(resolveCardShowIcon({ hasIcon: false })).toBe(false);
    expect(resolveCardShowIcon({ has_icon: true })).toBe(true);
    expect(resolveCardShowDescription({ hasDescription: false })).toBe(false);
    expect(resolveCardShowDescription({ has_description: true })).toBe(true);
    expect(resolveCardShowImage({ hasImage: false })).toBe(false);
    expect(resolveCardShowImage({ has_image: true })).toBe(true);
    expect(resolveCardShowLink({ hasLink: false })).toBe(false);
    expect(resolveCardShowLink({ has_link: true })).toBe(true);
    expect(resolveCardShowIcon({})).toBe(false);
    expect(resolveCardShowDescription({})).toBe(false);
  });

  it("resolves link_card with legacy button_card array", () => {
    const link = resolveCardLinkRecord({
      button_card: [{ __typename: "LinkRecord", id: "1", ctaLabel: "Go" }],
    });
    expect(link?.__typename).toBe("LinkRecord");
  });

  it("readFeatureGridCardContent applies all CARD toggles together", () => {
    const filled = {
      __typename: "CardRecord",
      id: "card-1",
      titleCard: "Título",
      hasIcon: true,
      iconCard: { prefix: "fas", iconName: "star" },
      hasDescription: true,
      descriptionCard: "Descrição",
      hasImage: true,
      imageCard: {
        __typename: "ImageBlockRecord",
        id: "img-1",
        asset: { url: "https://www.datocms-assets.com/a.jpg", alt: "foto", width: 800, height: 600 },
        assetDesktop: { url: "https://www.datocms-assets.com/b.jpg", alt: "foto", width: 1200, height: 900 },
      },
      hasLink: true,
      linkCard: {
        __typename: "LinkRecord",
        id: "link-1",
        ctaLabel: "Saber mais",
        typeContent: "external",
        externalLink: "https://example.com",
        openInNewTab: true,
      },
    } as CardRecord;

    const shown = readFeatureGridCardContent(filled, "pt");
    expect(shown.title).toBe("Título");
    expect(shown.description).toBe("Descrição");
    expect(shown.icon).toEqual({ prefix: "fas", iconName: "star" });
    expect(shown.image?.url).toContain("a.jpg");
    expect(shown.desktopImage?.url).toContain("b.jpg");
    expect(shown.linkLabel).toBe("Saber mais");
    expect(shown.link?.id).toBe("link-1");

    const hidden = readFeatureGridCardContent(
      { ...filled, hasIcon: false, hasDescription: false, hasImage: false, hasLink: false },
      "pt",
    );
    expect(hidden.title).toBe("Título");
    expect(hidden.description).toBe("");
    expect(hidden.icon).toBeNull();
    expect(hidden.image).toBeNull();
    expect(hidden.desktopImage).toBeNull();
    expect(hidden.link).toBeNull();
    expect(hidden.linkLabel).toBe("");
  });

  it("readFeatureGridCardContent treats empty optional description as blank", () => {
    const card = {
      __typename: "CardRecord",
      id: "card-2",
      titleCard: "Só título",
      hasIcon: false,
      hasDescription: true,
      descriptionCard: null,
      hasImage: false,
      hasLink: false,
    } as CardRecord;

    expect(readFeatureGridCardContent(card, "en").description).toBe("");
  });
});
