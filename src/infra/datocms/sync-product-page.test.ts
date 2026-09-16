import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockReadI18n } = vi.hoisted(() => ({
  mockReadI18n: vi.fn(async () => ({
    title: { pt: null as string | null, es: null as string | null },
    description: { pt: null as string | null, es: null as string | null },
  })),
}));

vi.mock("@/infra/shopify/admin-product-title", () => ({
  readShopifyProductTranslations: mockReadI18n,
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

describe("syncProductPageFromShopify", () => {
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

  it("creates and publishes when no record matches", async () => {
    listItemTypes.mockResolvedValue([{ id: "type-1", api_key: "product_page" }]);
    listItems.mockResolvedValue([]);
    createItem.mockResolvedValue({ id: "rec-1" });
    publishItem.mockResolvedValue({});

    const { syncProductPageFromShopify } = await import("@/infra/datocms/sync-product-page");
    const result = await syncProductPageFromShopify({
      id: "42",
      handle: "hat",
      title: "Hat",
      description: "A wool hat.",
    });

    expect(result).toEqual({ ok: true, id: "rec-1", created: true });
    expect(buildClient).toHaveBeenCalledWith({
      apiToken: "cma-test-token",
      environment: "develop",
    });
    expect(createItem).toHaveBeenCalledOnce();
    expect(createItem).toHaveBeenCalledWith(
      expect.objectContaining({
        title: { en: "Hat", "pt-BR": "Hat", es: "Hat" },
        description: { en: "A wool hat.", "pt-BR": "A wool hat.", es: "A wool hat." },
        shopify_handle: "hat",
        shopify_product_id: "42",
      }),
    );
    expect(publishItem).toHaveBeenCalledWith("rec-1");
  });

  it("updates handle and id without rewriting pt-BR or es when EN matches", async () => {
    listItemTypes.mockResolvedValue([{ id: "type-1", api_key: "product_page" }]);
    listItems.mockResolvedValue([{ id: "rec-9" }]);
    findItem.mockResolvedValue({
      id: "rec-9",
      title: { en: "Hat", "pt-BR": "Chapéu", es: "Sombrero" },
    });
    updateItem.mockResolvedValue({});
    publishItem.mockResolvedValue({});

    const { syncProductPageFromShopify } = await import("@/infra/datocms/sync-product-page");
    const result = await syncProductPageFromShopify({
      id: "42",
      handle: "hat",
      title: "Hat",
      description: "",
    });

    expect(result).toEqual({ ok: true, id: "rec-9", created: false });
    expect(updateItem).toHaveBeenCalledWith("rec-9", {
      shopify_product_id: "42",
      shopify_handle: "hat",
    });
    expect(updateItem.mock.calls[0]?.[1]).not.toHaveProperty("title");
    expect(createItem).not.toHaveBeenCalled();
  });

  it("updates only title.en when the Shopify title changed", async () => {
    listItemTypes.mockResolvedValue([{ id: "type-1", api_key: "product_page" }]);
    listItems.mockResolvedValue([{ id: "rec-9" }]);
    findItem.mockResolvedValue({
      id: "rec-9",
      title: { en: "Hat", "pt-BR": "Chapéu", es: "Sombrero" },
    });
    updateItem.mockResolvedValue({});
    publishItem.mockResolvedValue({});

    const { syncProductPageFromShopify } = await import("@/infra/datocms/sync-product-page");
    await syncProductPageFromShopify({
      id: "42",
      handle: "hat",
      title: "Hat v2",
      description: "",
    });

    expect(updateItem).toHaveBeenCalledWith("rec-9", {
      shopify_product_id: "42",
      shopify_handle: "hat",
      title: { en: "Hat v2", "pt-BR": "Chapéu", es: "Sombrero" },
    });
  });

  it("merges Shopify PT/ES translations without dropping Dato EN", async () => {
    listItemTypes.mockResolvedValue([{ id: "type-1", api_key: "product_page" }]);
    listItems.mockResolvedValue([{ id: "rec-9" }]);
    findItem.mockResolvedValue({
      id: "rec-9",
      title: { en: "Hat", "pt-BR": "Chapéu", es: "Sombrero" },
      description: { en: "Warm hat.", "pt-BR": "Chapéu quente.", es: "Sombrero" },
    });
    mockReadI18n.mockResolvedValue({
      title: { pt: "Chapéu BR", es: "Sombrero" },
      description: { pt: "Chapéu de lã.", es: null },
    });
    updateItem.mockResolvedValue({});
    publishItem.mockResolvedValue({});

    const { syncProductPageFromShopify } = await import("@/infra/datocms/sync-product-page");
    await syncProductPageFromShopify({
      id: "42",
      handle: "hat",
      title: "Hat",
      description: "Warm hat.",
    });

    expect(updateItem).toHaveBeenCalledWith("rec-9", {
      shopify_product_id: "42",
      shopify_handle: "hat",
      title: { en: "Hat", "pt-BR": "Chapéu BR", es: "Sombrero" },
      description: { en: "Warm hat.", "pt-BR": "Chapéu de lã.", es: "Sombrero" },
    });
  });

  it("returns not_configured without a CMA token", async () => {
    delete process.env.DATOCMS_USER_REVIEWS_CDA_TOKEN;
    const { syncProductPageFromShopify } = await import("@/infra/datocms/sync-product-page");
    await expect(
      syncProductPageFromShopify({ id: "1", handle: "x", title: "X", description: "" }),
    ).resolves.toEqual({ ok: false, reason: "not_configured" });
    expect(buildClient).not.toHaveBeenCalled();
  });

  it("defaults CMA environment to main when DATOCMS_ENVIRONMENT is unset", async () => {
    delete process.env.DATOCMS_ENVIRONMENT;
    listItemTypes.mockResolvedValue([{ id: "type-1", api_key: "product_page" }]);
    listItems.mockResolvedValue([]);
    createItem.mockResolvedValue({ id: "rec-1" });
    publishItem.mockResolvedValue({});

    const { syncProductPageFromShopify } = await import("@/infra/datocms/sync-product-page");
    await syncProductPageFromShopify({ id: "1", handle: "x", title: "X", description: "" });
    expect(buildClient).toHaveBeenCalledWith({
      apiToken: "cma-test-token",
      environment: "main",
    });
  });
});
