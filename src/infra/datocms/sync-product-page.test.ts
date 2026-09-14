import { beforeEach, describe, expect, it, vi } from "vitest";

const listItemTypes = vi.fn();
const listItems = vi.fn();
const createItem = vi.fn();
const updateItem = vi.fn();
const publishItem = vi.fn();
const buildClient = vi.fn(() => ({
  itemTypes: { list: listItemTypes },
  items: { list: listItems, create: createItem, update: updateItem, publish: publishItem },
}));

vi.mock("@datocms/cma-client-node", () => ({
  buildClient,
}));

describe("syncProductPageFromShopify", () => {
  beforeEach(() => {
    vi.resetModules();
    listItemTypes.mockReset();
    listItems.mockReset();
    createItem.mockReset();
    updateItem.mockReset();
    publishItem.mockReset();
    buildClient.mockClear();
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
    });

    expect(result).toEqual({ ok: true, id: "rec-1", created: true });
    expect(createItem).toHaveBeenCalledOnce();
    expect(publishItem).toHaveBeenCalledWith("rec-1");
  });

  it("updates by shopify_product_id when the record exists", async () => {
    listItemTypes.mockResolvedValue([{ id: "type-1", api_key: "product_page" }]);
    listItems.mockResolvedValueOnce([{ id: "rec-9" }]);
    updateItem.mockResolvedValue({});
    publishItem.mockResolvedValue({});

    const { syncProductPageFromShopify } = await import("@/infra/datocms/sync-product-page");
    const result = await syncProductPageFromShopify({
      id: "42",
      handle: "hat",
      title: "Hat",
    });

    expect(result).toEqual({ ok: true, id: "rec-9", created: false });
    expect(updateItem).toHaveBeenCalledWith(
      "rec-9",
      expect.objectContaining({ shopify_product_id: "42", shopify_handle: "hat" }),
    );
    expect(createItem).not.toHaveBeenCalled();
  });

  it("returns not_configured without a CMA token", async () => {
    delete process.env.DATOCMS_USER_REVIEWS_CDA_TOKEN;
    const { syncProductPageFromShopify } = await import("@/infra/datocms/sync-product-page");
    await expect(
      syncProductPageFromShopify({ id: "1", handle: "x", title: "X" }),
    ).resolves.toEqual({ ok: false, reason: "not_configured" });
  });
});
