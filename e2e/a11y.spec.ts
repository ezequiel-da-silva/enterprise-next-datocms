import { test, expect, type Page } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./a11y";

/** axe (WCAG 2.2 A/AA) on key surfaces; fails on critical/serious only. */
async function gotoMain(page: Page, path: string) {
  await page.goto(path);
  await expect(page.locator("main#main-content")).toBeVisible();
}

test.describe("accessibility", () => {
  test("home", async ({ page }) => {
    await gotoMain(page, "/en");
    await expectNoSeriousA11yViolations(page);
  });

  test("product page", async ({ page, request }) => {
    const res = await request.get("/sitemap.xml");
    const xml = res.ok() ? await res.text() : "";
    const loc = xml.match(/<loc>([^<]*\/products\/[^<]+)<\/loc>/)?.[1];
    test.skip(!loc, "no product URL in sitemap.xml");
    await gotoMain(page, new URL(loc!).pathname);
    await expectNoSeriousA11yViolations(page);
  });

  test("collection PLP", async ({ page, request }) => {
    const path = "/en/collections/hydrogen";
    const res = await request.get(path);
    test.skip(res.status() !== 200, `PLP unavailable (${path} → ${res.status()})`);
    await gotoMain(page, path);
    await expectNoSeriousA11yViolations(page);
  });

  test("collection filters drawer open", async ({ page, request }) => {
    const path = "/en/collections/hydrogen";
    const res = await request.get(path);
    test.skip(res.status() !== 200, `PLP unavailable (${path} → ${res.status()})`);
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoMain(page, path);
    const openFilters = page.locator('button[aria-haspopup="dialog"]').filter({
      hasText: /filter|filtro/i,
    });
    await expect(openFilters.first()).toBeVisible();
    await openFilters.first().click();
    const drawer = page.locator('[data-ui-section="CatalogFiltersDrawer"][role="dialog"]');
    await expect(drawer).toBeVisible({ timeout: 15_000 });
    await expectNoSeriousA11yViolations(page);
  });

  test("contact", async ({ page }) => {
    await gotoMain(page, "/en/contact");
    await expectNoSeriousA11yViolations(page);
  });

  test("cart (empty)", async ({ page, request }) => {
    const res = await request.get("/en/cart");
    test.skip(res.status() !== 200, "cart page unavailable (flag off)");
    await gotoMain(page, "/en/cart");
    await expectNoSeriousA11yViolations(page);
  });

  test("cart drawer open", async ({ page, request }) => {
    const res = await request.get("/en/cart");
    test.skip(res.status() !== 200, "cart unavailable (flag off)");
    await gotoMain(page, "/en");
    const cartButton = page.locator(".site-chrome").getByRole("button", { name: /Cart|Carrinho|Carrito/i });
    await expect(cartButton).toBeVisible();
    await cartButton.click();
    const drawer = page.getByRole("dialog").filter({ has: page.getByRole("heading", { name: /Cart|Carrinho|Carrito/i }) });
    await expect(drawer).toBeVisible({ timeout: 15_000 });
    await expectNoSeriousA11yViolations(page);
  });

  test("account", async ({ page, request }) => {
    const res = await request.get("/en/account");
    test.skip(res.status() === 404, "customer account is disabled (flag or env missing)");
    await gotoMain(page, "/en/account");
    await expectNoSeriousA11yViolations(page);
  });
});
