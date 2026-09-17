import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockReadI18n } = vi.hoisted(() => ({
  mockReadI18n: vi.fn(async () => ({
    title: { pt: null as string | null, es: null as string | null },
    description: { pt: null as string | null, es: null as string | null },
  })),
}));

vi.mock("@/infra/shopify/admin-collection-copy", () => ({
  readShopifyCollectionTranslations: mockReadI18n,
}));

const listItemTypes = vi.fn();
const listItems = vi.fn();
const findItem = vi.fn();
const createItem = vi.fn();
const updateItem = vi.fn();
const publishItem = vi.fn();
const buildClient = vi.fn(() => ({
  itemTypes: { list: listItemTypes },
  items: { list: listItems, find: findItem, create: createItem, update: updateItem, publish: publishItem },
}));

vi.mock("@datocms/cma-client-node", () => ({
  buildClient,
}));

describe("syncCollectionPageFromShopify", () => {
  beforeEach(() => {
    vi.resetModules();
    listItemTypes.mockReset();
    listItems.mockReset();
    findItem.mockReset();
    createItem.mockReset();
    updateItem.mockReset();
    publishItem.mockReset();
    buildClient.mockClear();
    mockReadI18n.mockReset();
    mockReadI18n.mockResolvedValue({
      title: { pt: null, es: null },
      description: { pt: null, es: null },
    });
    process.env.DATOCMS_USER_REVIEWS_CDA_TOKEN = "cma-test-token";
    process.env.DATOCMS_ENVIRONMENT = "develop";
  });

  it("skips frontpage without CMA", async () => {
    const { syncCollectionPageFromShopify } = await import("@/infra/datocms/sync-collection-page");
    await expect(
      syncCollectionPageFromShopify({ id: "1", handle: "frontpage", title: "Home", description: "" }),
    ).resolves.toEqual({ ok: true, skipped: true });
    expect(buildClient).not.toHaveBeenCalled();
  });

  it("creates and publishes when no record matches", async () => {
    listItemTypes.mockResolvedValue([{ id: "type-1", api_key: "collection_page" }]);
    listItems.mockResolvedValue([]);
    createItem.mockResolvedValue({ id: "rec-1" });
    publishItem.mockResolvedValue({});

    const { syncCollectionPageFromShopify } = await import("@/infra/datocms/sync-collection-page");
    const result = await syncCollectionPageFromShopify({
      id: "9",
      handle: "hydrogen",
      title: "Hydrogen",
      description: "Boards.",
    });

    expect(result).toEqual({ ok: true, id: "rec-1", created: true });
    expect(createItem).toHaveBeenCalledWith(
      expect.objectContaining({
        title: { en: "Hydrogen", "pt-BR": "Hydrogen", es: "Hydrogen" },
        description: { en: "Boards.", "pt-BR": "Boards.", es: "Boards." },
        shopify_handle: "hydrogen",
        shopify_collection_id: "9",
      }),
    );
  });

  it("keeps empty pt-BR and es keys on description update", async () => {
    listItemTypes.mockResolvedValue([{ id: "type-1", api_key: "collection_page" }]);
    listItems.mockResolvedValue([{ id: "rec-9" }]);
    findItem.mockResolvedValue({
      id: "rec-9",
      title: { en: "Hydrogen", "pt-BR": "Hidrogénio", es: "Hidrógeno" },
      description: { en: "Boards.", "pt-BR": "", es: "" },
    });
    updateItem.mockResolvedValue({});
    publishItem.mockResolvedValue({});

    const { syncCollectionPageFromShopify } = await import("@/infra/datocms/sync-collection-page");
    await syncCollectionPageFromShopify({
      id: "9",
      handle: "hydrogen",
      title: "Hydrogen",
      description: "New boards.",
    });

    expect(updateItem).toHaveBeenCalledWith("rec-9", {
      shopify_collection_id: "9",
      shopify_handle: "hydrogen",
      description: { en: "New boards.", "pt-BR": "", es: "" },
    });
  });

  it("returns not_configured without a CMA token", async () => {
    delete process.env.DATOCMS_USER_REVIEWS_CDA_TOKEN;
    const { syncCollectionPageFromShopify } = await import("@/infra/datocms/sync-collection-page");
    await expect(
      syncCollectionPageFromShopify({ id: "1", handle: "x", title: "X", description: "" }),
    ).resolves.toEqual({ ok: false, reason: "not_configured" });
  });
});
