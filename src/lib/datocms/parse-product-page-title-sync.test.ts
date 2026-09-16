import { describe, expect, it } from "vitest";
import {
  parseProductPageTitleSync,
  readDatoWebhookEventType,
  readTitleEn,
} from "@/lib/datocms/parse-product-page-title-sync";

const productPageWebhook = {
  event_type: "publish",
  entity: {
    id: "rec-1",
    type: "item",
    attributes: {
      title: { en: "Hat EN", "pt-BR": "Chapéu", es: "Sombrero" },
      description: { en: "Warm hat.", "pt-BR": "Chapéu quente.", es: "Sombrero caliente." },
      shopify_product_id: "42",
      shopify_handle: "hat",
    },
    relationships: { item_type: { data: { id: "type-pp" } } },
  },
  related_entities: [{ id: "type-pp", type: "item_type", attributes: { api_key: "product_page" } }],
};

describe("parseProductPageTitleSync", () => {
  it("reads en title and numeric Shopify id on publish", () => {
    expect(parseProductPageTitleSync(productPageWebhook)).toEqual({
      shopifyProductId: "42",
      titleEn: "Hat EN",
      titlePt: "Chapéu",
      titleEs: "Sombrero",
      descriptionEn: "Warm hat.",
      descriptionPt: "Chapéu quente.",
      descriptionEs: "Sombrero caliente.",
    });
  });

  it("accepts update events", () => {
    expect(parseProductPageTitleSync({ ...productPageWebhook, event_type: "update" })?.titleEn).toBe("Hat EN");
  });

  it("skips other models", () => {
    expect(
      parseProductPageTitleSync({
        ...productPageWebhook,
        related_entities: [{ id: "type-pp", type: "item_type", attributes: { api_key: "page" } }],
      }),
    ).toBeNull();
  });

  it("skips delete and unpublish", () => {
    expect(parseProductPageTitleSync({ ...productPageWebhook, event_type: "delete" })).toBeNull();
    expect(parseProductPageTitleSync({ ...productPageWebhook, event_type: "unpublish" })).toBeNull();
  });

  it("skips when en title is missing", () => {
    expect(
      parseProductPageTitleSync({
        ...productPageWebhook,
        entity: {
          ...productPageWebhook.entity,
          attributes: { title: { "pt-BR": "Chapéu" }, shopify_product_id: "42" },
        },
      }),
    ).toBeNull();
  });
});

describe("readTitleEn", () => {
  it("reads a plain string title", () => {
    expect(readTitleEn({ title: "  Hat  " })).toBe("Hat");
  });
});

describe("readDatoWebhookEventType", () => {
  it("returns null without event_type", () => {
    expect(readDatoWebhookEventType({})).toBeNull();
  });
});
