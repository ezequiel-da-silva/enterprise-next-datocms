import { describe, expect, it } from "vitest";
import {
  readCardCatalogTarget,
  readCardSource,
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

  it("defaults card_source to editorial", () => {
    expect(readCardSource({})).toBe("editorial");
    expect(readCardSource({ cardSource: "product" })).toBe("product");
    expect(readCardSource({ card_source: "collection" })).toBe("collection");
  });

  it("reads a catalog target only when the handle is present", () => {
    expect(
      readCardCatalogTarget({
        cardSource: "product",
        sourceProduct: { shopifyHandle: "hat", title: "Chapéu" },
      }),
    ).toEqual({ source: "product", handle: "hat", title: "Chapéu" });
    expect(readCardCatalogTarget({ cardSource: "product" })).toBeNull();
    expect(
      readCardCatalogTarget({
        card_source: "collection",
        source_collection: [{ shopify_handle: "summer", title: "Summer" }],
      }),
    ).toEqual({ source: "collection", handle: "summer", title: "Summer" });
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
        __typename: "CardImageBlockRecord",
        id: "img-1",
        assetMobile: { url: "https://www.datocms-assets.com/a.jpg", alt: "foto", width: 800, height: 600 },
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
    } as unknown as CardRecord;

    const shown = readFeatureGridCardContent(filled, "pt");
    expect(shown?.title).toBe("Título");
    expect(shown?.description).toBe("Descrição");
    expect(shown?.icon).toEqual({ prefix: "fas", iconName: "star" });
    expect(shown?.image?.url).toContain("a.jpg");
    expect(shown?.desktopImage?.url).toContain("b.jpg");
    expect(shown?.linkLabel).toBe("Saber mais");
    expect(shown?.link?.id).toBe("link-1");
    expect(shown?.source).toBe("editorial");
    expect(shown?.href).toBeNull();

    const hidden = readFeatureGridCardContent(
      { ...filled, hasIcon: false, hasDescription: false, hasImage: false, hasLink: false },
      "pt",
    );
    expect(hidden?.title).toBe("Título");
    expect(hidden?.description).toBe("");
    expect(hidden?.icon).toBeNull();
    expect(hidden?.image).toBeNull();
    expect(hidden?.desktopImage).toBeNull();
    expect(hidden?.link).toBeNull();
    expect(hidden?.linkLabel).toBe("");
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
    } as unknown as CardRecord;

    expect(readFeatureGridCardContent(card, "en")?.description).toBe("");
  });

  it("omits catalog cards without a handle or Storefront payload", () => {
    expect(
      readFeatureGridCardContent(
        { __typename: "CardRecord", id: "p", cardSource: "product" } as unknown as CardRecord,
        "en",
      ),
    ).toBeNull();
    expect(
      readFeatureGridCardContent(
        {
          __typename: "CardRecord",
          id: "p2",
          cardSource: "product",
          sourceProduct: { shopifyHandle: "hat", title: "Chapéu" },
        } as unknown as CardRecord,
        "en",
        { products: {}, collections: {} },
      ),
    ).toBeNull();
  });

  it("fills product and collection cards from the catalog", () => {
    const product = readFeatureGridCardContent(
      {
        __typename: "CardRecord",
        id: "p",
        cardSource: "product",
        sourceProduct: { shopifyHandle: "hat", title: "Chapéu" },
        hasDescription: true,
        descriptionCard: "Lã merino",
      } as unknown as CardRecord,
      "pt",
      {
        products: {
          hat: {
            handle: "hat",
            title: "Hat",
            availableForSale: true,
            featuredImage: { url: "https://cdn.shopify.com/hat.jpg", altText: "Hat", width: 800, height: 800 },
            priceRange: { minVariantPrice: { amount: "19.00", currencyCode: "BRL" } },
          },
        },
        collections: {},
      },
    );
    expect(product).toMatchObject({
      source: "product",
      title: "Chapéu",
      description: "Lã merino",
      href: "/pt/products/hat",
      priceLabel: expect.stringMatching(/19/),
    });
    expect(product?.catalogImage?.url).toContain("hat.jpg");
    expect(product?.link).toBeNull();

    const collection = readFeatureGridCardContent(
      {
        __typename: "CardRecord",
        id: "c",
        card_source: "collection",
        source_collection: { shopify_handle: "summer", title: "Verão" },
      } as unknown as CardRecord,
      "en",
      {
        products: {},
        collections: {
          summer: {
            handle: "summer",
            title: "Summer",
            image: { url: "https://cdn.shopify.com/summer.jpg", altText: null, width: 600, height: 400 },
          },
        },
      },
    );
    expect(collection).toMatchObject({
      source: "collection",
      title: "Verão",
      href: "/en/collections/summer",
      priceLabel: null,
    });
    expect(collection?.catalogImage?.url).toContain("summer.jpg");
  });
});
