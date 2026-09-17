import { describe, expect, it } from "vitest";
import { parseCollectionPageTitleSync } from "@/lib/datocms/parse-collection-page-title-sync";

const collectionPageWebhook = {
  event_type: "publish",
  entity: {
    id: "rec-1",
    type: "item",
    attributes: {
      title: { en: "Hydrogen EN", "pt-BR": "Hidrogénio", es: "Hidrógeno" },
      description: { en: "Boards.", "pt-BR": "Pranchas.", es: "Tablas." },
      shopify_collection_id: "9",
      shopify_handle: "hydrogen",
    },
    relationships: { item_type: { data: { id: "type-cp" } } },
  },
  related_entities: [{ id: "type-cp", type: "item_type", attributes: { api_key: "collection_page" } }],
};

describe("parseCollectionPageTitleSync", () => {
  it("reads en title and Shopify collection id on publish", () => {
    expect(parseCollectionPageTitleSync(collectionPageWebhook)).toEqual({
      shopifyCollectionId: "9",
      titleEn: "Hydrogen EN",
      titlePt: "Hidrogénio",
      titleEs: "Hidrógeno",
      descriptionEn: "Boards.",
      descriptionPt: "Pranchas.",
      descriptionEs: "Tablas.",
    });
  });

  it("skips other models", () => {
    expect(
      parseCollectionPageTitleSync({
        ...collectionPageWebhook,
        related_entities: [{ id: "type-cp", type: "item_type", attributes: { api_key: "product_page" } }],
      }),
    ).toBeNull();
  });
});
