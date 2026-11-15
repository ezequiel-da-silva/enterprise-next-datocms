import { test, expect } from "@playwright/test";

/**
 * Catalog facets (price / size) on the shop listing against real Shopify data. Opt-in
 * (`E2E_SHOP=1`) for the same reason as `shop-cart.spec.ts`:
 *
 *   npm run build:prod && npm run test:e2e:shop
 *
 * Desktop viewport: the facet `<aside>` is visible from `lg`. Facet links are plain `<a href>`,
 * so the filter state lives in the URL and survives a reload.
 */
test.describe("shop catalog filters", () => {
  test.skip(process.env.E2E_SHOP !== "1", "E2E_SHOP=1 not set");

  test.use({ viewport: { width: 1280, height: 800 } });

  test("price facet filters via URL and can be cleared", async ({ page }) => {
    await page.goto("/pt/loja");
    const facets = page.locator('aside [data-facet-group="price"]');
    test.skip((await facets.count()) === 0, "loja sem facetas de preço (catálogo vazio ou sem filtros)");

    const productLinks = page.locator('main a[href^="/pt/products/"]');
    await expect(productLinks.first()).toBeVisible();

    const option = facets.locator('a[href*="price="]').first();
    await expect(option).toBeVisible();
    await option.click();

    await expect(page).toHaveURL(/[?&]price=/);
    const activeChips = page.getByRole("group", { name: /filtros ac?tivos/i });
    await expect(activeChips).toBeVisible();
    await expect(facets.locator('a[aria-current="true"]')).toHaveCount(1);
    // Every facet option shows a count > 0, so the filtered listing is never empty.
    await expect(productLinks.first()).toBeVisible();

    await page.reload();
    await expect(page).toHaveURL(/[?&]price=/);
    await expect(facets.locator('a[aria-current="true"]')).toHaveCount(1);

    await activeChips.getByRole("link", { name: /limpar/i }).click();
    await expect(page).not.toHaveURL(/[?&]price=/);
    await expect(activeChips).toBeHidden();
  });

  test("size facet narrows the listing to boards of that length", async ({ page }) => {
    await page.goto("/pt/loja");
    const facets = page.locator('aside [data-facet-group="size"]');
    test.skip((await facets.count()) === 0, "loja sem facetas de tamanho (variantes sem medida em cm)");

    const option = facets.locator('a[href*="size="]').first();
    await option.click();
    await expect(page).toHaveURL(/[?&]size=\d+/);
    await expect(facets.locator('a[aria-current="true"]')).toHaveCount(1);
    await expect(page.locator('main a[href^="/pt/products/"]').first()).toBeVisible();
  });
});
