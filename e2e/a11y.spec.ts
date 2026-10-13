import { test, expect, type Page } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./a11y";

/** axe (WCAG 2.1 A/AA) on Home, a PDP and the account page; fails on critical/serious only. */
async function gotoMain(page: Page, path: string) {
  await page.goto(path);
  await expect(page.locator("main#conteudo-principal")).toBeVisible();
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

  test("account", async ({ page, request }) => {
    const res = await request.get("/en/account");
    test.skip(res.status() === 404, "customer account is disabled (flag or env missing)");
    await gotoMain(page, "/en/account");
    await expectNoSeriousA11yViolations(page);
  });
});
