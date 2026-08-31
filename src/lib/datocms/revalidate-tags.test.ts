import { describe, expect, it } from "vitest";
import {
  coarseDatocmsCacheTags,
  DATOCMS_CACHE_TAGS,
  isCdaCacheTagsPayload,
  resolveWebhookItemTypeApiKey,
  tagsToRevalidateFromWebhook,
  type DatoWebhookBody,
} from "@/lib/datocms/revalidate-tags";

const pageWebhook: DatoWebhookBody = {
  entity: {
    id: "page-1",
    type: "item",
    attributes: { slug: "page-two", locale: "en" },
    relationships: { item_type: { data: { id: "type-page" } } },
  },
  related_entities: [{ id: "type-page", type: "item_type", attributes: { api_key: "page" } }],
};

describe("isCdaCacheTagsPayload", () => {
  it("detects Dato CDA invalidate payloads", () => {
    expect(isCdaCacheTagsPayload({ entity: { attributes: { tags: ["abc", "def"] } } })).toBe(true);
  });

  it("rejects item payloads", () => {
    expect(isCdaCacheTagsPayload(pageWebhook)).toBe(false);
  });
});

describe("resolveWebhookItemTypeApiKey", () => {
  it("reads api_key from related item_type", () => {
    expect(resolveWebhookItemTypeApiKey(pageWebhook)).toBe("page");
  });
});

describe("tagsToRevalidateFromWebhook", () => {
  it("maps a page item to page family + slug tag", () => {
    const tags = tagsToRevalidateFromWebhook(pageWebhook);
    expect(tags).toContain(DATOCMS_CACHE_TAGS.page);
    expect(tags).toContain("page:en:page-two");
    expect(tags).toContain(DATOCMS_CACHE_TAGS.sitemap);
    expect(tags).not.toContain("page:pt:page-two");
  });

  it("maps localized slug hashes", () => {
    const tags = tagsToRevalidateFromWebhook({
      entity: {
        type: "item",
        attributes: { slug: { en: "about", pt_BR: "sobre" } },
        relationships: { item_type: { data: { id: "t" } } },
      },
      related_entities: [{ id: "t", type: "item_type", attributes: { api_key: "page" } }],
    });
    expect(tags).toContain("page:en:about");
    expect(tags).toContain("page:pt:sobre");
    expect(tags).not.toContain("page:es:about");
  });

  it("maps posts, authors and categories", () => {
    const post = tagsToRevalidateFromWebhook({
      entity: {
        id: "post-1",
        attributes: { post_slug: "hello", locale: "pt" },
        relationships: { item_type: { data: { id: "t" } } },
      },
      related_entities: [{ id: "t", type: "item_type", attributes: { api_key: "post" } }],
    });
    expect(post).toContain("post:pt:hello");
    expect(post).toContain(DATOCMS_CACHE_TAGS.posts);

    const author = tagsToRevalidateFromWebhook({
      entity: {
        id: "auth-9",
        attributes: { authorSlug: "ada" },
        relationships: { item_type: { data: { id: "t" } } },
      },
      related_entities: [{ id: "t", type: "item_type", attributes: { api_key: "author" } }],
    });
    expect(author).toContain("author:en:ada");
    expect(author).toContain("author-posts:auth-9");

    const category = tagsToRevalidateFromWebhook({
      entity: {
        id: "cat-2",
        attributes: { category_slug: "news" },
        relationships: { item_type: { data: { id: "t" } } },
      },
      related_entities: [{ id: "t", type: "item_type", attributes: { api_key: "category" } }],
    });
    expect(category).toContain("category:en:news");
    expect(category).toContain("category-posts:cat-2");
  });

  it("maps navigation and global_setting without slugs", () => {
    const nav = tagsToRevalidateFromWebhook({
      entity: { relationships: { item_type: { data: { id: "t" } } } },
      related_entities: [{ id: "t", type: "item_type", attributes: { api_key: "navigation" } }],
    });
    expect(nav).toContain(DATOCMS_CACHE_TAGS.navigation);
    expect(nav).toContain("navigation:pt");

    const settings = tagsToRevalidateFromWebhook({
      entity: { relationships: { item_type: { data: { id: "t" } } } },
      related_entities: [{ id: "t", type: "item_type", attributes: { api_key: "global_setting" } }],
    });
    expect(settings).toContain(DATOCMS_CACHE_TAGS.globalSettings);
  });

  it("uses coarse tags for CDA cache-tag events and unknown models", () => {
    const cda = tagsToRevalidateFromWebhook({ entity: { attributes: { tags: ["opaque-1"] } } });
    expect(cda).toEqual(coarseDatocmsCacheTags());

    const unknown = tagsToRevalidateFromWebhook({
      entity: { relationships: { item_type: { data: { id: "t" } } } },
      related_entities: [{ id: "t", type: "item_type", attributes: { api_key: "cta_banner" } }],
    });
    expect(unknown).toEqual(coarseDatocmsCacheTags());
  });
});
