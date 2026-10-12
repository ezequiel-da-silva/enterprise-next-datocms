import { test, expect, type Page } from "@playwright/test";

/**
 * Loja → produto → carrinho against real Shopify data. Opt-in (`E2E_SHOP=1`) because it needs
 * Storefront credentials, the production Dato content and `SHOPIFY_CART_ENABLED=1`:
 *
 *   npm run build:prod && npm run test:e2e:shop
 *
 * Stops before checkout — the test purchase is manual (docs/SHOPIFY.md → Go-live).
 */
test.describe("shop cart", () => {
  test.skip(process.env.E2E_SHOP !== "1", "E2E_SHOP=1 not set");

  const MAX_PRODUCTS_TRIED = 5;

  /** The PDP streams behind `loading.tsx`; wait for the cart button (add or sold out) before deciding. */
  async function addToCartButton(page: Page) {
    const cartButton = page.getByRole("button", { name: /^(Adicionar ao carrinho|Esgotado)$/ });
    try {
      await cartButton.first().waitFor({ timeout: 15_000 });
    } catch {
      return null;
    }
    const button = page.getByRole("button", { name: "Adicionar ao carrinho" });
    return (await button.count()) > 0 && (await button.isEnabled()) ? button : null;
  }

  test("adds a product, updates quantity and removes it", async ({ page }) => {
    await page.goto("/pt/loja");
    const productLinks = page.locator('main a[href^="/pt/products/"]');
    await expect(productLinks.first()).toBeVisible();
    const hrefs = [...new Set(await productLinks.evaluateAll((els) => els.map((el) => el.getAttribute("href") ?? "")))];

    await productLinks.first().click();
    await expect(page).toHaveURL(/\/pt\/products\//);

    let button = await addToCartButton(page);
    for (const href of hrefs.slice(1, MAX_PRODUCTS_TRIED)) {
      if (button) break;
      await page.goto(href);
      button = await addToCartButton(page);
    }
    test.skip(!button, "sem produto disponível com variante Shopify nos primeiros produtos da loja");

    await button!.click();
    await expect(page.getByRole("status")).toContainText("Adicionado ao carrinho.");
    await expect(page.getByRole("link", { name: "Carrinho, 1 item" })).toBeVisible();

    await page.goto("/pt/cart");
    await expect(page.getByRole("heading", { level: 1, name: "Carrinho" })).toBeVisible();
    await page.getByRole("spinbutton", { name: "Quantidade" }).fill("2");
    await page.getByRole("button", { name: "Atualizar" }).click();
    await expect(page.getByRole("link", { name: "Carrinho, 2 itens" })).toBeVisible();

    const checkout = page.getByRole("link", { name: "Finalizar compra" });
    const checkoutUrl = new URL((await checkout.getAttribute("href")) ?? "");
    const checkoutDomain = process.env.SHOPIFY_CHECKOUT_DOMAIN?.trim().toLowerCase();
    expect(checkoutUrl.protocol).toBe("https:");
    expect(
      checkoutUrl.hostname.endsWith(".myshopify.com") || (checkoutDomain && checkoutUrl.hostname === checkoutDomain),
    ).toBeTruthy();

    await page.getByRole("button", { name: "Remover" }).click();
    await expect(page.getByText("Seu carrinho está vazio.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Carrinho, 0 itens" })).toBeVisible();
  });
});
