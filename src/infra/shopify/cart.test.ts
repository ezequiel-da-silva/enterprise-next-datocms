import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addCartLines, createCart, getCart } from "@/infra/shopify/cart";

const CART = {
  id: "gid://shopify/Cart/c1-abc?key=k",
  checkoutUrl: "https://shop.myshopify.com/cart/c/c1-abc?key=k",
  totalQuantity: 2,
  cost: {
    subtotalAmount: { amount: "38.00", currencyCode: "BRL" },
    totalAmount: { amount: "38.00", currencyCode: "BRL" },
  },
  lines: {
    nodes: [
      {
        id: "gid://shopify/CartLine/l1?cart=c1-abc",
        quantity: 2,
        cost: { totalAmount: { amount: "38.00", currencyCode: "BRL" } },
        merchandise: {
          id: "gid://shopify/ProductVariant/2",
          title: "Red / M",
          selectedOptions: [{ name: "Color", value: "Red" }],
          image: { url: "https://cdn.shopify.com/hat.jpg", altText: null, width: 600, height: 600 },
          price: { amount: "19.00", currencyCode: "BRL" },
          product: { title: "Hat", handle: "hat" },
        },
      },
      { id: "broken" },
    ],
  },
};

function mockFetch(data: unknown) {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data }) });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("Storefront cart", () => {
  beforeEach(() => {
    process.env.SHOPIFY_STORE_DOMAIN = "shop.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "token";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("maps a cart and drops malformed lines", async () => {
    mockFetch({ cart: CART });
    const cart = await getCart(CART.id, "pt");
    expect(cart?.totalQuantity).toBe(2);
    expect(cart?.checkoutUrl).toBe(CART.checkoutUrl);
    expect(cart?.lines).toHaveLength(1);
    expect(cart?.lines[0]).toMatchObject({ productHandle: "hat", variantTitle: "Red / M", quantity: 2 });
  });

  it("moves the cart to the locale's market when the country differs", async () => {
    const usCart = { ...CART, buyerIdentity: { countryCode: "US" } };
    const brCart = { ...CART, buyerIdentity: { countryCode: "BR" } };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: { cart: usCart } }) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { cartBuyerIdentityUpdate: { cart: brCart, userErrors: [] } } }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const cart = await getCart(CART.id, "pt");
    expect(cart?.countryCode).toBe("BR");
    const body = JSON.parse(fetchMock.mock.calls[1][1].body as string);
    expect(body.variables.buyerIdentity.countryCode).toBe("BR");
  });

  it("does not update when the cart is already in the locale's market", async () => {
    const fetchMock = mockFetch({ cart: { ...CART, buyerIdentity: { countryCode: "BR" } } });
    await getCart(CART.id, "pt");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("drops a checkout URL on an unexpected host", async () => {
    mockFetch({ cart: { ...CART, checkoutUrl: "https://evil.example/cart" } });
    const cart = await getCart(CART.id, "en");
    expect(cart?.checkoutUrl).toBeNull();
  });

  it("sends country context and buyer identity on create", async () => {
    const fetchMock = mockFetch({ cartCreate: { cart: CART, userErrors: [] } });
    const result = await createCart([{ merchandiseId: "gid://shopify/ProductVariant/2", quantity: 1 }], "pt");
    expect(result.ok).toBe(true);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.variables.country).toBe("BR");
    expect(body.variables.input.buyerIdentity.countryCode).toBe("BR");
  });

  it("returns ok:false on userErrors", async () => {
    mockFetch({ cartLinesAdd: { cart: null, userErrors: [{ field: ["lines"], message: "Sold out" }] } });
    const result = await addCartLines(CART.id, [{ merchandiseId: "gid://shopify/ProductVariant/2", quantity: 1 }], "en");
    expect(result.ok).toBe(false);
  });

  it("returns null / ok:false when the token is missing", async () => {
    delete process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
    await expect(getCart(CART.id, "en")).resolves.toBeNull();
    await expect(createCart([], "en")).resolves.toEqual({ ok: false });
  });
});
